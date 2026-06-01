# LLM tutor-quality comparison

Providers: DeepSeek-V3 (`deepseek-chat`), Qwen2.5-72B (OpenRouter) (`qwen/qwen-2.5-72b-instruct`), GPT-4o — premium baseline (OpenRouter) (`openai/gpt-4o`), Claude Sonnet 4.5 — premium baseline (OpenRouter) (`anthropic/claude-sonnet-4.5`)


---

## Free tutor chat + correction — Korean native learning ENGLISH (core market)

**What to judge:** Is the English reply natural+level-appropriate? Is the Korean correction explanation natural, warm, and pedagogically correct?

**Learner input:** Yesterday I go to school and meet my friend. We are play soccer.


### DeepSeek-V3 — 1509ms

```
Great! I went to school and met my friend yesterday. Did you have fun playing soccer?
[교정] go → went, meet → met, are play → played
과거 이야기할 때는 동사를 과거형으로 바꿔야 해요.
```


### Qwen2.5-72B (OpenRouter) — 4427ms

```
That sounds like a fun day! What did you do after playing soccer? [교정] Yesterday I go → Yesterday I went / We are play → We played 과거 시제를 사용해야 해요.
```


### GPT-4o — premium baseline (OpenRouter) — 1170ms

```
Yesterday sounds fun! What else did you do at school?

[교정] I go to school → I went to school  
[교정] meet my friend → met my friend  
[교정] We are play soccer → We played soccer  
어제 일어난 일이라서 과거형을 사용해야 해요.
```


### Claude Sonnet 4.5 — premium baseline (OpenRouter) — 3391ms

```
That sounds like fun! Did you win the soccer game?

[교정] Yesterday I go → Yesterday I went
과거 시제에서는 'go'를 'went'로 바꿔야 해요.

[교정] We are play → We played
과거에 한 일이니까 'played'만 쓰면 돼요.
```


---

## Pronunciation coach note — Korean native, English word (light gpt-4o-mini task)

**What to judge:** Is the Korean coaching tone warm + natural (Rudy persona)? One short sentence, concrete.

**Learner input:** The learner said the word "world" and scored 58/100. Weak sounds: the "r" and the final "ld" cluster.


### DeepSeek-V3 — 1599ms

```
여우 루디: "월드"라고 할 때 'r' 소리는 혀를 살짝 말아서, 'ld'는 끝까지 혀끝이 윗니 뒤에 닿게 해보세요! 잘하고 있어요~
```


### Qwen2.5-72B (OpenRouter) — 2652ms

```
'r' 소리와 'ld' 클러스터를 좀 더 명확하게 발음해 보세요. 'r'은 입을 조금 더 크게 벌리고, 'ld'는 혀의 위치를 정확히 하면 좋아질 거예요! 잘하고 있어요!
```


### GPT-4o — premium baseline (OpenRouter) — 1528ms

```
"‘R’ 소리를 낼 때 혀를 입천장 쪽으로 살짝 올려보세요, 그리고 ‘ld’는 혀끝을 윗니 뒤에 대고 소리를 내면 더 잘 들릴 거예요. 잘하고 있어요!"
```


### Claude Sonnet 4.5 — premium baseline (OpenRouter) — 4831ms

```
"r" 소리를 낼 때 혀를 입천장에 닿지 않게 뒤로 말아주시고, "ld" 발음은 혀끝을 윗니 뒷부분에 가볍게 대면서 끝까지 소리내보세요 - 연습하면 금방 좋아질 거예요! 🦊
```


---

## Korean PRODUCTION — English native learning KOREAN (hardest: honorifics/particles)

**What to judge:** Is the produced Korean grammatically correct + natural for a beginner? Honorifics/particles right? Romanization helpful? English explanation clear?

**Learner input:** How do I say 'I would like a coffee, please' in Korean?


### DeepSeek-V3 — 1260ms

```
커피 한 잔 주세요.
keopi han jan juseyo.
Coffee one cup please give me.
한 번 따라 해보세요.
```


### Qwen2.5-72B (OpenRouter) — 4869ms

```
커피 한 잔 주세요.
keopi han jan juseyo.
I would like a coffee, please.
반복해 볼래요?
```


### GPT-4o — premium baseline (OpenRouter) — 660ms

```
커피 주세요.  
Keopi juseyo.  
Please give me a coffee.  

따라 해 보세요.
```


### Claude Sonnet 4.5 — premium baseline (OpenRouter) — 2820ms

```
커피 한 잔 주세요.

Keo-pi han jan ju-se-yo.

"Coffee one cup please give me."

This is the most natural way to order coffee in Korean! Try saying it out loud: "Keo-pi han jan ju-se-yo." 😊
```


---

## NPC roleplay — Korean native learning INDONESIAN (BETA, low-resource)

**What to judge:** Is the Indonesian natural + correct for a café scenario? Stays in character, beginner-appropriate.

**Learner input:** Halo, saya mau pesan kopi.


### DeepSeek-V3 — 1030ms

```
Tentu, kopi susu atau kopi hitam, Mas?
```


### Qwen2.5-72B (OpenRouter) — 829ms

```
Halo, mau kopi apa, Pak?
```


### GPT-4o — premium baseline (OpenRouter) — 1421ms

```
Tentu, mau kopi hitam atau kopi susu?
```


### Claude Sonnet 4.5 — premium baseline (OpenRouter) — 1750ms

```
Baik, mau kopi apa?
```


---

## Structured JSON output — learner diagnosis (instruction-following reliability)

**What to judge:** Does it return STRICT valid JSON with exactly the requested keys? No prose, no code fences.

**Learner input:** Learner says (Korean): "안녕하세요, 저는 회사 다니는데 출장을 자주 가서 영어로 호텔 체크인이랑 미팅 잡는 걸 연습하고 싶어요. 간단한 문장은 말할 수 있어요."


### DeepSeek-V3 — 1099ms

```
{"level":"A2","goals":["work","travel"],"note":"출장 관련 영어 회화 연습이 필요합니다."}
```


### Qwen2.5-72B (OpenRouter) — 7060ms

```
{"level":"A2","goals":["work"],"note":"간단한 영어 표현을 사용할 수 있어요."}
```


### GPT-4o — premium baseline (OpenRouter) — 590ms

```
{"level":"A2","goals":["work","travel"],"note":"영어 공부를 열심히 하세요."}
```


### Claude Sonnet 4.5 — premium baseline (OpenRouter) — 2430ms

```
```json
{
  "level": "A2",
  "goals": ["work", "travel"],
  "note": "출장 관련 실무 영어 표현 학습이 필요합니다."
}
```
```
