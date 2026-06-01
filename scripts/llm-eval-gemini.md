# LLM tutor-quality comparison

Providers: DeepSeek-V3 (incumbent, direct) (`deepseek-chat`), Gemini 2.5 Flash (OpenRouter) (`google/gemini-2.5-flash`), Gemini 2.5 Pro (OpenRouter) (`google/gemini-2.5-pro`), Claude Sonnet 4.5 — quality anchor (OpenRouter) (`anthropic/claude-sonnet-4.5`)


---

## Free tutor chat + correction — Korean native learning ENGLISH (core market)

**What to judge:** Is the English reply natural+level-appropriate? Is the Korean correction explanation natural, warm, and pedagogically correct?

**Learner input:** Yesterday I go to school and meet my friend. We are play soccer.


### DeepSeek-V3 (incumbent, direct) — 1207ms

```
Great! I went to school yesterday and met my friend. We played soccer.  
[교정] go → went, meet → met, are play → played  
동사는 시간에 따라 모양이 달라져요.
```


### Gemini 2.5 Flash (OpenRouter) — 2109ms

```
That sounds like fun! Did you win your soccer game?
[교정] I go → I went / We are play → We played
'go'는 어제 일이니까 과거형 'went'를 써야 해요. 'are play'는 어색해요. 과거에 한 행동이니까 'played'가 맞아요!
```


### Gemini 2.5 Pro (OpenRouter) — 5239ms

```
That sounds like a fun day! Did you win the soccer game?
```


### Claude Sonnet 4.5 — quality anchor (OpenRouter) — 3541ms

```
That sounds like fun! Did you win the soccer game?

[교정] Yesterday I go → Yesterday I went
과거 시제를 쓸 때는 동사를 과거형으로 바꿔야 해요.

[교정] We are play → We played
과거에 한 일이니까 "played"를 써야 해요.
```


---

## Pronunciation coach note — Korean native, English word (light gpt-4o-mini task)

**What to judge:** Is the Korean coaching tone warm + natural (Rudy persona)? One short sentence, concrete.

**Learner input:** The learner said the word "world" and scored 58/100. Weak sounds: the "r" and the final "ld" cluster.


### DeepSeek-V3 (incumbent, direct) — 1670ms

```
여우 루디: "월드"라고 할 때 'r' 소리는 혀를 안쪽으로 말아서, 'ld'는 혀 끝을 윗니 뒤에 붙이고 '을드'처럼 끝까지 힘 줘 발음해 봐요! 잘할 수 있어요!
```


### Gemini 2.5 Flash (OpenRouter) — 1139ms

```
"world" 발음에서 'r'과 'ld' 소리가 더 명확하게 들리도록 혀 위치를 신경 써서 연습해 보세요! 🦊✨
```


### Gemini 2.5 Pro (OpenRouter) — 7387ms

```
혀를 뒤로 살짝 당기면서 '월
```


### Claude Sonnet 4.5 — quality anchor (OpenRouter) — 5090ms

```
한국어에는 없는 소리라 어렵죠! "r" 발음할 때 혀를 입천장에 닿지 않게 뒤로 말아주시고, "ld"는 혀끝을 윗니 뒷부분에 가볍게 대면서 "ㄹ드"가 아닌 "을드"처럼 연결해보세요! 🦊
```


---

## Korean PRODUCTION — English native learning KOREAN (hardest: honorifics/particles)

**What to judge:** Is the produced Korean grammatically correct + natural for a beginner? Honorifics/particles right? Romanization helpful? English explanation clear?

**Learner input:** How do I say 'I would like a coffee, please' in Korean?


### DeepSeek-V3 (incumbent, direct) — 1310ms

```
커피 한 잔 주세요.
keopi han jan juseyo.
Coffee one cup please. (polite)
이렇게 말해 보세요.
```


### Gemini 2.5 Flash (OpenRouter) — 1010ms

```
커피 주세요.
Keopi juseyo.
Coffee, please.

Can you try saying that?
```


### Gemini 2.5 Pro (OpenRouter) — 5530ms

```
커피 주세요.
Keopi juseyo.
Coffee,
```


### Claude Sonnet 4.5 — quality anchor (OpenRouter) — 3380ms

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


### DeepSeek-V3 (incumbent, direct) — 851ms

```
Tentu, mau kopi apa, hangat atau dingin?
```


### Gemini 2.5 Flash (OpenRouter) — 738ms

```
Selamat datang! Mau kopi apa?
```


### Gemini 2.5 Pro (OpenRouter) — 5931ms

```
Mau kopi apa, kak?
```


### Claude Sonnet 4.5 — quality anchor (OpenRouter) — 2350ms

```
Baik, mau kopi apa?
```


---

## Structured JSON output — learner diagnosis (instruction-following reliability)

**What to judge:** Does it return STRICT valid JSON with exactly the requested keys? No prose, no code fences.

**Learner input:** Learner says (Korean): "안녕하세요, 저는 회사 다니는데 출장을 자주 가서 영어로 호텔 체크인이랑 미팅 잡는 걸 연습하고 싶어요. 간단한 문장은 말할 수 있어요."


### DeepSeek-V3 (incumbent, direct) — 1100ms

```
{"level":"A2","goals":["work","travel"],"note":"출장 영어 회화 연습이 필요해 보입니다."}
```


### Gemini 2.5 Flash (OpenRouter) — 1050ms

```
{
  "level": "A2",
  "goals": [
    "travel",
    "work"
  ],
  "note": "출장 시 필요한 영어를 배우고 싶어 합니다."
}
```


### Gemini 2.5 Pro (OpenRouter) — 6600ms

```
{
  "
```


### Claude Sonnet 4.5 — quality anchor (OpenRouter) — 2480ms

```
```json
{
  "level": "A2",
  "goals": ["work", "travel"],
  "note": "출장 상황에서 필요한 실용적인 비즈니스 영어 회화 연습이 필요합니다."
}
```
```
