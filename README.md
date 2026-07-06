# 6단원 · He Has Blue Eyes! (사람 묘사하기)

영어 **6단원** '사람 묘사하기' 학습용 웹앱입니다.
수업 PPT(*He Has Blue Eyes*)의 표현 — `He has blue eyes.` `She's wearing a yellow dress.` 등 —
을 듣고·따라 말하며 익히고, **나만의 묘사 문장까지 직접 만들어 볼 수 있도록** 만들었습니다.

## 꼭 배우는 표현

- **색깔** — red, blue, yellow, purple, brown, blonde …
- **신체** — eyes(눈) · nose(코) · hair(머리카락) · ears(귀)
- **크기** — big(크다) · small(작다)
- **모양** — straight(곧은) · curly(곱슬곱슬한)
- **옷·소품** — dress, hat, glasses, mask, boots, helmet …
- **패턴** — `He/She has ~` (신체) · `He's/She's wearing ~` (입은 것)

## 학습 흐름 (STEP)

**단어 → 문장 → 만들기 → 말하기** 순서로 단계를 밟아 공부합니다. 각 단계 끝의
**다음 단계 ▶** 버튼으로 이어집니다.

- **STEP 1 · 🎨 단어 익히기** — 색깔(12) · 크기/모양(6) · 신체(6) · 옷/소품(10)
  - 낱말마다 **예문 ▶**(그 단어로 만든 문장)을 들려줘 단어 → 문장으로 이어줌
  - 크기·신체·옷 낱말은 **뜻을 보여주는 SVG 캐릭터 그림**으로 표시
- **STEP 2 · 👀 문장 배우기** — 인물 28명 × 초급·중급·고급 = **84문장**
  (👀 눈 / 💇 머리카락 / 👃 코·귀 / 👗 입은 것)
  - 맨 위에 **문형 뼈대**(What does he/she look like? · has ~ · is wearing ~) 제시
  - 카드마다 **성별에 맞는 질문(Q. What does he/she look like?)이 먼저** 나오고,
    누르면 **질문 → 대답** 순서로 들려줌
  - 카드의 캐릭터 그림은 **문장 내용 그대로 SVG로** 그려져 눈으로 확인하며 배워요
  - 🙈 **스스로 확인 모드** — 문장을 가리고 그림·질문만 보고 말한 뒤 **정답 확인 👀** (능동 회상)
  - PPT의 표현 모두 포함: blue eyes · long yellow hair · purple hair · braid ·
    mask · cowboy hat and boots · yellow dress · red and gold metal helmet · glasses
- **STEP 3 · 🧩 문장 만들기** — `누구(He/She)` + `has/wearing` + `꾸미는 말`을 골라 조합
  - **🙌 has**(신체) · **👕 wearing**(입은 것) 중 하나, 또는 **🙌+👕 둘 다**를 골라
    **두 문장**까지 만들 수 있어요 (예: *She has long dark hair. She's wearing a red dress.*)
  - 어색한 조합(curly nose, big hair 등)은 **맞는지 검사**해 이유를 알려주고,
    올바른 문장은 **문장 + 한글 번역 + 질문·대답 듣기 + 똑같이 생긴 캐릭터 그림** 제공
  - 🎲 무작위 조합 버튼, ⭐로 (두 문장도) 연습 목록에 담기
- **STEP 4 · 🎤 말하기 연습** — ⭐로 담은 문장을 마이크로 말하면 **발음 정확도** 측정 (Chrome 권장)
- 단어 클릭 시 **뜻 풍선 + 발음**, 말하기 **속도 조절** 슬라이더

브라우저 내장 **Web Speech API**(음성 합성·음성 인식)를 사용합니다.
선택한 문장과 연습 기록은 브라우저(localStorage)에 저장됩니다.

## 사용 방법

`index.html`을 브라우저(크롬 권장)에서 열면 됩니다. 별도 설치가 필요 없습니다.

## 파일 구성

| 파일 | 설명 |
|------|------|
| `index.html` | 화면 구조(탭·섹션) |
| `style.css`  | 디자인·퀴즈·캐릭터 카드 스타일 |
| `data.js`    | 묘사 문장·낱말·문장 만들기·퀴즈 데이터, 단어 뜻 사전 |
| `app.js`     | 음성·단어 풍선·SVG 캐릭터 그리기·문장 만들기·퀴즈·연습 채점 로직 |
