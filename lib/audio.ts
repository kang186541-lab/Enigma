import { Audio } from "expo-av";
import { Platform } from "react-native";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Linear interpolation downsampler.
 * iOS Safari AudioContext often runs at 44100/48000 Hz regardless of what you
 * request. Azure Pronunciation Assessment works most reliably at 16 kHz, so
 * we resample before building the WAV file.
 */
function downsampleTo16k(samples: Float32Array, fromRate: number): Float32Array {
  if (fromRate === 16000) return samples;
  const ratio = fromRate / 16000;
  const outLen = Math.floor(samples.length / ratio);
  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const pos = i * ratio;
    const lo = Math.floor(pos);
    const hi = Math.min(lo + 1, samples.length - 1);
    out[i] = samples[lo] + (samples[hi] - samples[lo]) * (pos - lo);
  }
  return out;
}

function buildWavBuffer(pcm16: Int16Array, sampleRate: number): ArrayBuffer {
  const numCh = 1, bps = 16;
  const dataBytes = pcm16.length * 2;
  const buf = new ArrayBuffer(44 + dataBytes);
  const v = new DataView(buf);
  const str = (s: string, o: number) => {
    for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i));
  };
  str("RIFF", 0);
  v.setUint32(4, 36 + dataBytes, true);
  str("WAVE", 8);
  str("fmt ", 12);
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, numCh, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * numCh * bps / 8, true);
  v.setUint16(32, numCh * bps / 8, true);
  v.setUint16(34, bps, true);
  str("data", 36);
  v.setUint32(40, dataBytes, true);
  for (let i = 0; i < pcm16.length; i++) v.setInt16(44 + i * 2, pcm16[i], true);
  return buf;
}

/**
 * Record from the microphone and return { base64, mimeType }.
 * Works on web (Chrome/Firefox → webm/opus; iOS Safari → WAV via AudioContext)
 * and native (expo-av → m4a).
 */
export async function recordAudio(
  durationMs: number
): Promise<{ base64: string; mimeType: string }> {
  if (Platform.OS !== "web") {
    return recordNative(durationMs);
  }
  return recordWeb(durationMs);
}

async function recordWeb(durationMs: number): Promise<{ base64: string; mimeType: string }> {
  const MR = (window as any).MediaRecorder as typeof MediaRecorder;

  // Path 1: webm/opus — Chrome, Firefox, Edge (Azure accepts directly)
  const opusMime =
    MR?.isTypeSupported?.("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" :
    MR?.isTypeSupported?.("audio/ogg;codecs=opus")  ? "audio/ogg;codecs=opus"  : null;

  if (opusMime) {
    const stream = await (navigator.mediaDevices as any).getUserMedia({ audio: true, video: false });
    const recorder = new MR(stream, { mimeType: opusMime });
    const chunks: BlobPart[] = [];

    await new Promise<void>((resolve, reject) => {
      recorder.ondataavailable = (e: BlobEvent) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => resolve();
      recorder.onerror = () => reject(new Error("MediaRecorder error"));
      recorder.start(200);
      setTimeout(() => recorder.stop(), durationMs);
    });
    stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());

    if (!chunks.length) throw new Error("No audio captured — check microphone permission");

    const blob = new Blob(chunks, { type: opusMime });
    return { base64: await blobToBase64(blob), mimeType: opusMime };
  }

  // Path 2: iOS Safari — AudioContext → 16-bit mono WAV
  const stream = await (navigator.mediaDevices as any).getUserMedia({
    audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true },
    video: false,
  });
  const ctx = new (window as any).AudioContext({ sampleRate: 16000 }) as AudioContext;
  if ((ctx as any).state !== "running") await ctx.resume();

  const actualRate = ctx.sampleRate;
  const source = ctx.createMediaStreamSource(stream);
  const pcmChunks: Float32Array[] = [];

  const processor = ctx.createScriptProcessor(4096, 1, 1);
  processor.onaudioprocess = (e: AudioProcessingEvent) => {
    pcmChunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));
  };
  source.connect(processor);
  processor.connect(ctx.destination);

  await new Promise<void>((r) => setTimeout(r, durationMs));

  source.disconnect();
  processor.disconnect();
  stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
  await ctx.close();

  if (!pcmChunks.length) throw new Error("No audio captured — microphone may be blocked");

  const total = pcmChunks.reduce((n, c) => n + c.length, 0);
  const flat = new Float32Array(total);
  let off = 0;
  for (const c of pcmChunks) { flat.set(c, off); off += c.length; }

  const rms = Math.sqrt(flat.reduce((s, v) => s + v * v, 0) / flat.length);
  if (rms < 0.001) throw new Error("Recording was silent — speak louder or check microphone");

  // Downsample to 16 kHz if iOS locked us to a higher sample rate
  const resampled = downsampleTo16k(flat, actualRate);
  const outRate = 16000;

  const pcm16 = new Int16Array(resampled.length);
  for (let i = 0; i < resampled.length; i++) {
    pcm16[i] = Math.round(Math.max(-1, Math.min(1, resampled[i])) * 32767);
  }

  const wavBuf = buildWavBuffer(pcm16, outRate);
  const bytes = new Uint8Array(wavBuf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return { base64: btoa(bin), mimeType: "audio/wav" };
}

async function recordNative(durationMs: number): Promise<{ base64: string; mimeType: string }> {
  const { granted } = await Audio.requestPermissionsAsync();
  if (!granted) throw new Error("Microphone permission denied");

  await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

  const { recording } = await Audio.Recording.createAsync(
    Audio.RecordingOptionsPresets.HIGH_QUALITY
  );

  await new Promise((r) => setTimeout(r, durationMs));
  await recording.stopAndUnloadAsync();
  await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

  const uri = recording.getURI();
  if (!uri) throw new Error("No recording URI");

  const res = await fetch(uri);
  const blob = await res.blob();
  return { base64: await blobToBase64(blob), mimeType: "audio/x-m4a" };
}
