# LLM tutor-quality comparison

Providers: DeepSeek-V3 (incumbent, direct) (`deepseek-chat`), Gemini 2.5 Flash (OpenRouter) (`google/gemini-2.5-flash`), Gemini 2.5 Pro (OpenRouter) (`google/gemini-2.5-pro`), Claude Sonnet 4.5 — quality anchor (OpenRouter) (`anthropic/claude-sonnet-4.5`)


---

## Free tutor chat + correction — Korean native learning ENGLISH (core market)

**What to judge:** Is the English reply natural+level-appropriate? Is the Korean correction explanation natural, warm, and pedagogically correct?

**Learner input:** Yesterday I go to school and meet my friend. We are play soccer.


### DeepSeek-V3 (incumbent, direct) — 1535ms

```
That's great! Did you have fun playing soccer with your friend?
[교정] go → went / meet → met / are play → played  
과거 이야기할 땐 동사를 과거형으로 바꿔야 해요.
```


### Gemini 2.5 Flash (OpenRouter) — 2319ms

```
That sounds like fun! Did you win your soccer game?

[교정] I go → I went
'Yesterday'는 과거를 나타내니까 'go' 대신 'went'를 써야 해요.
```


### Gemini 2.5 Pro (OpenRouter) — 12139ms

```
That sounds fun! Did you win the soccer game?

[교정] go → went, meet → met, are play → played
'Yesterday'는 어제니까, 동사도 과거형으로 써주는 게 자연스러워요.
```


### Claude Sonnet 4.5 — quality anchor (OpenRouter) — 3739ms

```
That sounds fun! I love soccer too! Did you win the game?

[교정] Yesterday I go → Yesterday I went
과거 시제를 쓸 때는 동사를 과거형으로 바꿔야 해요.

[교정] We are play → We played
과거에 한 일이니까 "played"를 써야 해요. "are playing"은 지금 하고 있을 때 쓰는 표현이에요.
```


---

## Pronunciation coach note — Korean native, English word (light gpt-4o-mini task)

**What to judge:** Is the Korean coaching tone warm + natural (Rudy persona)? One short sentence, concrete.

**Learner input:** The learner said the word "world" and scored 58/100. Weak sounds: the "r" and the final "ld" cluster.


### DeepSeek-V3 (incumbent, direct) — 1731ms

```
여우 루디: "월드"라고 할 때 'r' 소리는 혀를 살짝 말아서, 'ld'는 끝까지 혀끝이 윗니 뒤에 닿게 해보세요. 천천히 연습하면 더 좋아질 거예요!
```


### Gemini 2.5 Flash (OpenRouter) — 2000ms

```
"world" 발음에서 'r'과 'ld' 소리를 더 선명하게 내려면, 혀를 뒤로 살짝 당기고 'l' 소리 다음에 혀끝으로 윗니 뒤쪽을 가볍게 쳐보세요! 🦊✨
```


### Gemini 2.5 Pro (OpenRouter) — 16596ms

```
혀를 뒤로 살짝 당겨 'r' 소리를 낸 다음, 혀끝으로 '을드' 소리를 이어서 내면 훨씬 자연스러울 거예요
```


### Claude Sonnet 4.5 — quality anchor (OpenRouter) — 4790ms

```
한국어에는 없는 소리라 어렵죠! 'r' 발음할 때 혀를 입천장에 대지 말고 뒤로 말아주시고, 'ld'는 혀끝을 윗니 뒤에 가볍게 대면서 'd' 소리를 명확하게 내보세요! 🦊
```


---

## Korean PRODUCTION — English native learning KOREAN (hardest: honorifics/particles)

**What to judge:** Is the produced Korean grammatically correct + natural for a beginner? Honorifics/particles right? Romanization helpful? English explanation clear?

**Learner input:** How do I say 'I would like a coffee, please' in Korean?


### DeepSeek-V3 (incumbent, direct) — 1119ms

```
커피 한 잔 주세요.
keopi han jan juseyo.
Coffee one cup please. (I would like a coffee, please.)
Can you try saying it?
```


### Gemini 2.5 Flash (OpenRouter) — 1080ms

```
커피 주세요.
Keopi juseyo.
Coffee, please.

Can you try saying that?
```


### Gemini 2.5 Pro (OpenRouter) — 14750ms

```
커피 주세요.
Keopi juseyo.
Coffee, please.

Now, you try
```


### Claude Sonnet 4.5 — quality anchor (OpenRouter) — 2710ms

```
커피 한 잔 주세요.

Keo-pi han jan ju-se-yo.

"Coffee one cup please give me."

This is a polite way to order coffee! Try saying it out loud: "Keo-pi han jan ju-se-yo." 😊
```


---

## NPC roleplay — Korean native learning INDONESIAN (BETA, low-resource)

**What to judge:** Is the Indonesian natural + correct for a café scenario? Stays in character, beginner-appropriate.

**Learner input:** Halo, saya mau pesan kopi.


### DeepSeek-V3 (incumbent, direct) — 1010ms

```
Tentu, mau kopi apa, panas atau dingin?
```


### Gemini 2.5 Flash (OpenRouter) — 840ms

```
Selamat datang! Mau kopi apa?
```


### Gemini 2.5 Pro (OpenRouter) — 7280ms

```
Kopi apa, kak?
```


### Claude Sonnet 4.5 — quality anchor (OpenRouter) — 1919ms

```
Baik, mau kopi apa?
```


---

## Structured JSON output — learner diagnosis (instruction-following reliability)

**What to judge:** Does it return STRICT valid JSON with exactly the requested keys? No prose, no code fences.

**Learner input:** Learner says (Korean): "안녕하세요, 저는 회사 다니는데 출장을 자주 가서 영어로 호텔 체크인이랑 미팅 잡는 걸 연습하고 싶어요. 간단한 문장은 말할 수 있어요."


### DeepSeek-V3 (incumbent, direct) — 1101ms

```
{"level":"B1","goals":["work","travel"],"note":"출장 영어 회화 연습이 필요해 보입니다."}
```


### Gemini 2.5 Flash (OpenRouter) — 1039ms

```
{
  "level": "A2",
  "goals": [
    "travel",
    "work"
  ],
  "note": "출장 시 호텔 체크인과 미팅 예약에 필요한 영어 회화를 연습하고 싶어 합니다."
}
```


### Gemini 2.5 Pro (OpenRouter) — 8461ms

```
{
  "level": "A2",
  "goals": [
    "work"
  ],
  "note": "출장 시 필요한 비즈니스 영어를 연습하고 싶어 하십니다."
}
```


### Claude Sonnet 4.5 — quality anchor (OpenRouter) — 2669ms

```
```json
{
  "level": "A2",
  "goals": ["work", "travel"],
  "note": "출장 관련 실용 영어 표현 학습이 필요합니다."
}
```
```
