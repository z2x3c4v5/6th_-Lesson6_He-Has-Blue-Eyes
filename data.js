/* =========================================================
 * 6단원 · He Has Blue Eyes! (사람 묘사하기) 데이터
 * - 묘사 문장 : 초급 / 중급 / 고급  각 28개 (인덱스별 같은 인물)
 * - 카테고리 : eyes(눈) / hair(머리카락) / face(코·귀) / wear(입은 것)
 * - 낱말 : 색깔 · 크기/모양 · 신체 · 옷/소품
 * - 문장 만들기용 데이터 (has ~ / is wearing ~ 조합)
 * - 단어 뜻 사전
 *  ※ 교과서(PPT) 표현 모두 포함:
 *    He has blue eyes. / He has long yellow(blonde) hair. /
 *    She has purple hair and brown eyes. /
 *    She has long yellow hair in a braid. /
 *    He's wearing a mask. / He's wearing a cowboy hat and boots. /
 *    She's wearing a yellow dress. /
 *    He's wearing a red and gold metal helmet. /
 *    She has long dark hair. She's wearing a red dress. /
 *    He has short brown hair. He's wearing glasses.
 *  ※ 필수 어휘 포함:
 *    색깔(red, blue, yellow …) · 신체(eyes, nose, hair, ears) ·
 *    크기(big, small) · 모양(straight, curly) ·
 *    옷/소품(dress, hat, glasses …)
 * ========================================================= */

/* ===== 색깔 이름 → 그림 색 ===== */
const COLOR_HEX = {
  red: "#ef4444", orange: "#f97316", yellow: "#fbbf24", green: "#22c55e",
  blue: "#3b82f6", purple: "#a855f7", pink: "#f472b6", brown: "#8b5e34",
  black: "#33302e", white: "#f8fafc", gray: "#9ca3af", blonde: "#fcd34d",
  dark: "#3b3230", gold: "#eab308",
};

/* 카테고리: 같은 인덱스끼리 같은 인물/종류 */
const DESC_CATEGORIES = [
  "eyes","eyes","eyes","eyes","eyes","eyes",                       // 0~5  👀 눈 (6)
  "hair","hair","hair","hair","hair","hair","hair",                 // 6~12 💇 머리카락 (7)
  "face","face","face","face","face","face",                        // 13~18 👃 코·귀 (6)
  "wear","wear","wear","wear","wear","wear","wear","wear","wear",   // 19~27 👗 입은 것 (9)
];

/* ===== 인덱스별 인물 생김새 (SVG 캐릭터 그리기용) =====
 * boy / hairLen(long·short) / hairStyle(straight·curly) / hairColor
 * eyeColor / eyeSize·noseSize·earSize(big·small·보통은 생략)
 * braid(땋은 머리) / glasses / sunglasses / mask / boots
 * hat: cap(야구모자)·cowboy·sun(챙모자)·helmet / hatColor / dress(색) */
const DESC_FACES = [
  // 👀 눈
  { boy: true,  hairLen: "short", hairStyle: "straight", hairColor: "brown",  eyeColor: "blue",  eyeSize: "big" },
  { boy: false, hairLen: "long",  hairStyle: "straight", hairColor: "black",  eyeColor: "brown", eyeSize: "big" },
  { boy: true,  hairLen: "short", hairStyle: "curly",    hairColor: "red",    eyeColor: "green", eyeSize: "small" },
  { boy: false, hairLen: "long",  hairStyle: "straight", hairColor: "brown",  eyeColor: "green", eyeSize: "big", earSize: "small" },
  { boy: true,  hairLen: "short", hairStyle: "straight", hairColor: "black",  eyeColor: "black", eyeSize: "small", noseSize: "big" },
  { boy: false, hairLen: "long",  hairStyle: "straight", hairColor: "blonde", eyeColor: "blue",  eyeSize: "big" },
  // 💇 머리카락
  { boy: true,  hairLen: "long",  hairStyle: "straight", hairColor: "blonde", eyeColor: "blue" },
  { boy: false, hairLen: "short", hairStyle: "straight", hairColor: "purple", eyeColor: "brown", eyeSize: "big" },
  { boy: true,  hairLen: "short", hairStyle: "straight", hairColor: "black",  eyeColor: "brown", earSize: "small" },
  { boy: false, hairLen: "long",  hairStyle: "straight", hairColor: "brown",  eyeColor: "brown" },
  { boy: true,  hairLen: "short", hairStyle: "curly",    hairColor: "brown",  eyeColor: "brown", eyeSize: "big" },
  { boy: false, hairLen: "long",  hairStyle: "curly",    hairColor: "red",    eyeColor: "green" },
  { boy: false, hairLen: "long",  hairStyle: "straight", hairColor: "blonde", eyeColor: "blue", braid: true },
  // 👃 코·귀
  { boy: true,  hairLen: "short", hairStyle: "straight", hairColor: "gray",   eyeColor: "black", eyeSize: "small", noseSize: "big" },
  { boy: false, hairLen: "long",  hairStyle: "straight", hairColor: "brown",  eyeColor: "brown", eyeSize: "big", noseSize: "small" },
  { boy: true,  hairLen: "short", hairStyle: "curly",    hairColor: "black",  eyeColor: "brown", earSize: "big", noseSize: "small" },
  { boy: false, hairLen: "long",  hairStyle: "straight", hairColor: "blonde", eyeColor: "blue", eyeSize: "big", earSize: "small" },
  { boy: true,  hairLen: "short", hairStyle: "straight", hairColor: "brown",  eyeColor: "brown", eyeSize: "big", earSize: "big", noseSize: "big" },
  { boy: false, hairLen: "short", hairStyle: "straight", hairColor: "black",  eyeColor: "black", eyeSize: "small", earSize: "small", noseSize: "small" },
  // 👗 입은 것
  { boy: false, hairLen: "long",  hairStyle: "straight", hairColor: "brown",  eyeColor: "brown", dress: "yellow", hat: "sun", hatColor: "yellow" },
  { boy: true,  hairLen: "short", hairStyle: "straight", hairColor: "brown",  eyeColor: "brown", glasses: true },
  { boy: true,  hairLen: "short", hairStyle: "straight", hairColor: "black",  eyeColor: "brown", mask: true, hat: "cap", hatColor: "black" },
  { boy: true,  hairLen: "short", hairStyle: "straight", hairColor: "brown",  eyeColor: "brown", hat: "cowboy", boots: true },
  { boy: true,  hairLen: "short", hairStyle: "straight", hairColor: "black",  eyeColor: "brown", hat: "helmet", hatColor: "red" },
  { boy: false, hairLen: "long",  hairStyle: "curly",    hairColor: "brown",  eyeColor: "brown", hat: "sun", hatColor: "pink", dress: "white" },
  { boy: true,  hairLen: "short", hairStyle: "straight", hairColor: "brown",  eyeColor: "blue",  hat: "cap", hatColor: "blue", glasses: true },
  { boy: false, hairLen: "short", hairStyle: "curly",    hairColor: "black",  eyeColor: "brown", sunglasses: true },
  { boy: false, hairLen: "long",  hairStyle: "straight", hairColor: "dark",   eyeColor: "brown", dress: "red" },
];

/* ===== 묘사 문장 (난이도 3단계 · 인덱스별 같은 인물) ===== */
const DESC_LEVELS = {
  beginner: [
    // 👀 눈
    { en: "He has blue eyes.",            ko: "그는 파란 눈을 가지고 있어요.",        emoji: "👦" },
    { en: "She has brown eyes.",          ko: "그녀는 갈색 눈을 가지고 있어요.",      emoji: "👧" },
    { en: "He has green eyes.",           ko: "그는 초록색 눈을 가지고 있어요.",      emoji: "👦" },
    { en: "She has big eyes.",            ko: "그녀는 큰 눈을 가지고 있어요.",        emoji: "👧" },
    { en: "He has small eyes.",           ko: "그는 작은 눈을 가지고 있어요.",        emoji: "👦" },
    { en: "She has blue eyes.",           ko: "그녀는 파란 눈을 가지고 있어요.",      emoji: "👧" },
    // 💇 머리카락
    { en: "He has yellow hair.",          ko: "그는 노란 머리를 가지고 있어요.",      emoji: "👱" },
    { en: "She has purple hair.",         ko: "그녀는 보라색 머리를 가지고 있어요.",  emoji: "👧" },
    { en: "He has black hair.",           ko: "그는 검은 머리를 가지고 있어요.",      emoji: "👦" },
    { en: "She has long hair.",           ko: "그녀는 긴 머리를 가지고 있어요.",      emoji: "👧" },
    { en: "He has curly hair.",           ko: "그는 곱슬머리를 가지고 있어요.",       emoji: "👨‍🦱" },
    { en: "She has red hair.",            ko: "그녀는 빨간 머리를 가지고 있어요.",    emoji: "👩‍🦰" },
    { en: "She has yellow hair.",         ko: "그녀는 노란 머리를 가지고 있어요.",    emoji: "👱‍♀️" },
    // 👃 코·귀
    { en: "He has a big nose.",           ko: "그는 큰 코를 가지고 있어요.",          emoji: "👃" },
    { en: "She has a small nose.",        ko: "그녀는 작은 코를 가지고 있어요.",      emoji: "👧" },
    { en: "He has big ears.",             ko: "그는 큰 귀를 가지고 있어요.",          emoji: "👂" },
    { en: "She has small ears.",          ko: "그녀는 작은 귀를 가지고 있어요.",      emoji: "👧" },
    { en: "He has big eyes.",             ko: "그는 큰 눈을 가지고 있어요.",          emoji: "👀" },
    { en: "She has small eyes.",          ko: "그녀는 작은 눈을 가지고 있어요.",      emoji: "👧" },
    // 👗 입은 것
    { en: "She's wearing a dress.",       ko: "그녀는 드레스를 입고 있어요.",         emoji: "👗" },
    { en: "He's wearing glasses.",        ko: "그는 안경을 쓰고 있어요.",             emoji: "👓" },
    { en: "He's wearing a mask.",         ko: "그는 마스크를 쓰고 있어요.",           emoji: "😷" },
    { en: "He's wearing a hat.",          ko: "그는 모자를 쓰고 있어요.",             emoji: "🤠" },
    { en: "He's wearing a helmet.",       ko: "그는 헬멧을 쓰고 있어요.",             emoji: "⛑️" },
    { en: "She's wearing a hat.",         ko: "그녀는 모자를 쓰고 있어요.",           emoji: "👒" },
    { en: "He's wearing a cap.",          ko: "그는 야구 모자를 쓰고 있어요.",        emoji: "🧢" },
    { en: "She's wearing sunglasses.",    ko: "그녀는 선글라스를 끼고 있어요.",       emoji: "🕶️" },
    { en: "She's wearing a red dress.",   ko: "그녀는 빨간색 드레스를 입고 있어요.",  emoji: "👗" },
  ],
  intermediate: [
    // 👀 눈
    { en: "He has big blue eyes.",              ko: "그는 크고 파란 눈을 가지고 있어요.",         emoji: "👦" },
    { en: "She has big brown eyes.",            ko: "그녀는 큰 갈색 눈을 가지고 있어요.",         emoji: "👧" },
    { en: "He has small green eyes.",           ko: "그는 작은 초록색 눈을 가지고 있어요.",       emoji: "👦" },
    { en: "She has big green eyes.",            ko: "그녀는 큰 초록색 눈을 가지고 있어요.",       emoji: "👧" },
    { en: "He has small black eyes.",           ko: "그는 작고 까만 눈을 가지고 있어요.",         emoji: "👦" },
    { en: "She has big blue eyes.",             ko: "그녀는 크고 파란 눈을 가지고 있어요.",       emoji: "👧" },
    // 💇 머리카락
    { en: "He has long yellow hair.",           ko: "그는 긴 노란 머리를 가지고 있어요.",         emoji: "👱" },
    { en: "She has purple hair and brown eyes.", ko: "그녀는 보라색 머리와 갈색 눈을 가지고 있어요.", emoji: "👧" },
    { en: "He has short black hair.",           ko: "그는 짧은 검은 머리를 가지고 있어요.",       emoji: "👦" },
    { en: "She has long straight hair.",        ko: "그녀는 긴 생머리를 가지고 있어요.",          emoji: "👧" },
    { en: "He has curly brown hair.",           ko: "그는 곱슬곱슬한 갈색 머리를 가지고 있어요.", emoji: "👨‍🦱" },
    { en: "She has curly red hair.",            ko: "그녀는 곱슬곱슬한 빨간 머리를 가지고 있어요.", emoji: "👩‍🦰" },
    { en: "She has long yellow hair.",          ko: "그녀는 긴 노란 머리를 가지고 있어요.",       emoji: "👱‍♀️" },
    // 👃 코·귀
    { en: "He has a big nose and small eyes.",  ko: "그는 큰 코와 작은 눈을 가지고 있어요.",      emoji: "👃" },
    { en: "She has a small nose and big eyes.", ko: "그녀는 작은 코와 큰 눈을 가지고 있어요.",    emoji: "👧" },
    { en: "He has big ears and a small nose.",  ko: "그는 큰 귀와 작은 코를 가지고 있어요.",      emoji: "👂" },
    { en: "She has small ears and big blue eyes.", ko: "그녀는 작은 귀와 크고 파란 눈을 가지고 있어요.", emoji: "👧" },
    { en: "He has big eyes and big ears.",      ko: "그는 큰 눈과 큰 귀를 가지고 있어요.",        emoji: "👀" },
    { en: "She has small eyes and a small nose.", ko: "그녀는 작은 눈과 작은 코를 가지고 있어요.", emoji: "👧" },
    // 👗 입은 것
    { en: "She's wearing a yellow dress.",      ko: "그녀는 노란색 드레스를 입고 있어요.",        emoji: "👗" },
    { en: "He's wearing black glasses.",        ko: "그는 까만 안경을 쓰고 있어요.",              emoji: "👓" },
    { en: "He's wearing a blue mask.",          ko: "그는 파란색 마스크를 쓰고 있어요.",          emoji: "😷" },
    { en: "He's wearing a cowboy hat.",         ko: "그는 카우보이 모자를 쓰고 있어요.",          emoji: "🤠" },
    { en: "He's wearing a red helmet.",         ko: "그는 빨간색 헬멧을 쓰고 있어요.",            emoji: "⛑️" },
    { en: "She's wearing a pink hat.",          ko: "그녀는 분홍색 모자를 쓰고 있어요.",          emoji: "👒" },
    { en: "He's wearing a blue cap.",           ko: "그는 파란색 야구 모자를 쓰고 있어요.",       emoji: "🧢" },
    { en: "She's wearing big sunglasses.",      ko: "그녀는 큰 선글라스를 끼고 있어요.",          emoji: "🕶️" },
    { en: "She has long dark hair. She's wearing a red dress.", ko: "그녀는 긴 검은 머리를 가지고 있어요. 빨간색 드레스를 입고 있어요.", emoji: "👗" },
  ],
  advanced: [
    // 👀 눈
    { en: "He has blue eyes and short brown hair.",     ko: "그는 파란 눈과 짧은 갈색 머리를 가지고 있어요.",       emoji: "👦" },
    { en: "She has brown eyes and long black hair.",    ko: "그녀는 갈색 눈과 긴 검은 머리를 가지고 있어요.",       emoji: "👧" },
    { en: "He has green eyes and curly red hair.",      ko: "그는 초록색 눈과 곱슬곱슬한 빨간 머리를 가지고 있어요.", emoji: "👦" },
    { en: "She has big green eyes and small ears.",     ko: "그녀는 큰 초록색 눈과 작은 귀를 가지고 있어요.",       emoji: "👧" },
    { en: "He has small eyes and a big nose.",          ko: "그는 작은 눈과 큰 코를 가지고 있어요.",               emoji: "👦" },
    { en: "She has big blue eyes and blonde hair.",     ko: "그녀는 크고 파란 눈과 금발 머리를 가지고 있어요.",     emoji: "👧" },
    // 💇 머리카락
    { en: "He has long blonde hair and blue eyes.",     ko: "그는 긴 금발 머리와 파란 눈을 가지고 있어요.",         emoji: "👱" },
    { en: "She has short purple hair and big brown eyes.", ko: "그녀는 짧은 보라색 머리와 큰 갈색 눈을 가지고 있어요.", emoji: "👧" },
    { en: "He has short straight black hair.",          ko: "그는 짧고 곧은 검은 머리를 가지고 있어요.",           emoji: "👦" },
    { en: "She has long straight brown hair.",          ko: "그녀는 길고 곧은 갈색 머리를 가지고 있어요.",          emoji: "👧" },
    { en: "He has short curly brown hair and big eyes.", ko: "그는 짧고 곱슬곱슬한 갈색 머리와 큰 눈을 가지고 있어요.", emoji: "👨‍🦱" },
    { en: "She has long curly red hair and green eyes.", ko: "그녀는 길고 곱슬곱슬한 빨간 머리와 초록색 눈을 가지고 있어요.", emoji: "👩‍🦰" },
    { en: "She has long yellow hair in a braid.",       ko: "그녀는 땋은 긴 노란 머리를 가지고 있어요.",            emoji: "👱‍♀️" },
    // 👃 코·귀
    { en: "He has a big nose, small eyes, and gray hair.", ko: "그는 큰 코, 작은 눈, 회색 머리를 가지고 있어요.",   emoji: "👃" },
    { en: "She has a small nose and big brown eyes.",   ko: "그녀는 작은 코와 큰 갈색 눈을 가지고 있어요.",         emoji: "👧" },
    { en: "He has big ears and short curly black hair.", ko: "그는 큰 귀와 짧은 곱슬곱슬한 검은 머리를 가지고 있어요.", emoji: "👂" },
    { en: "She has small ears and long blonde hair.",   ko: "그녀는 작은 귀와 긴 금발 머리를 가지고 있어요.",       emoji: "👧" },
    { en: "He has big eyes, big ears, and a big nose.", ko: "그는 큰 눈, 큰 귀, 큰 코를 가지고 있어요.",            emoji: "👀" },
    { en: "She has small eyes, a small nose, and small ears.", ko: "그녀는 작은 눈, 작은 코, 작은 귀를 가지고 있어요.", emoji: "👧" },
    // 👗 입은 것
    { en: "She's wearing a yellow dress and a hat.",    ko: "그녀는 노란색 드레스를 입고 모자를 쓰고 있어요.",      emoji: "👗" },
    { en: "He has short brown hair. He's wearing glasses.", ko: "그는 짧은 갈색 머리를 가지고 있어요. 안경을 쓰고 있어요.", emoji: "👓" },
    { en: "He's wearing a mask and a black cap.",       ko: "그는 마스크와 까만 야구 모자를 쓰고 있어요.",          emoji: "😷" },
    { en: "He's wearing a cowboy hat and boots.",       ko: "그는 카우보이 모자를 쓰고 부츠를 신고 있어요.",        emoji: "🤠" },
    { en: "He's wearing a red and gold metal helmet.",  ko: "그는 빨간색과 금색의 금속 헬멧을 쓰고 있어요.",        emoji: "⛑️" },
    { en: "She's wearing a pink hat and a white dress.", ko: "그녀는 분홍색 모자를 쓰고 하얀색 드레스를 입고 있어요.", emoji: "👒" },
    { en: "He's wearing a blue cap and glasses.",       ko: "그는 파란색 야구 모자와 안경을 쓰고 있어요.",          emoji: "🧢" },
    { en: "She has curly black hair. She's wearing sunglasses.", ko: "그녀는 곱슬곱슬한 검은 머리를 가지고 있어요. 선글라스를 끼고 있어요.", emoji: "🕶️" },
    { en: "She has long dark hair and brown eyes. She's wearing a red dress.", ko: "그녀는 긴 검은 머리와 갈색 눈을 가지고 있어요. 빨간색 드레스를 입고 있어요.", emoji: "👗" },
  ],
};

/* ===== 🎨 색깔 낱말 (swatch: 카드에 색 동그라미로 표시) =====
 * ex: 이 단어로 만드는 문장 (단어 → 문장 다리) */
const COLOR_WORDS = [
  { en: "red",    ko: "빨간색", swatch: "#ef4444", ex: "She has red hair." },
  { en: "orange", ko: "주황색", swatch: "#f97316", ex: "He's wearing an orange hat." },
  { en: "yellow", ko: "노란색", swatch: "#fbbf24", ex: "He has yellow hair." },
  { en: "green",  ko: "초록색", swatch: "#22c55e", ex: "He has green eyes." },
  { en: "blue",   ko: "파란색", swatch: "#3b82f6", ex: "He has blue eyes." },
  { en: "purple", ko: "보라색", swatch: "#a855f7", ex: "She has purple hair." },
  { en: "pink",   ko: "분홍색", swatch: "#f472b6", ex: "She's wearing a pink dress." },
  { en: "brown",  ko: "갈색",   swatch: "#8b5e34", ex: "She has brown eyes." },
  { en: "black",  ko: "검은색", swatch: "#33302e", ex: "He has black hair." },
  { en: "white",  ko: "하얀색", swatch: "#f8fafc", ex: "She's wearing a white dress." },
  { en: "gray",   ko: "회색",   swatch: "#9ca3af", ex: "He has gray hair." },
  { en: "blonde", ko: "금발",   swatch: "#fcd34d", ex: "She has blonde hair." },
];

/* ===== 📏 크기·모양 낱말 (필수: big/small/straight/curly) =====
 * face: 뜻을 눈으로 보여주는 캐릭터 그림 (highlight로 해당 부분 강조) */
const SIZE_WORDS = [
  { en: "big",      ko: "큰",           emoji: "🐘", ex: "He has big eyes.",
    face: { boy: true,  hairLen: "short", hairColor: "brown", eyeColor: "brown", eyeSize: "big",   highlight: "eyes" } },
  { en: "small",    ko: "작은",         emoji: "🐭", ex: "She has a small nose.",
    face: { boy: true,  hairLen: "short", hairColor: "brown", eyeColor: "brown", eyeSize: "small", highlight: "eyes" } },
  { en: "long",     ko: "긴",           emoji: "📏", ex: "She has long hair.",
    face: { boy: false, hairLen: "long",  hairStyle: "straight", hairColor: "brown", eyeColor: "brown", highlight: "hair" } },
  { en: "short",    ko: "짧은",         emoji: "✂️", ex: "He has short hair.",
    face: { boy: true,  hairLen: "short", hairStyle: "straight", hairColor: "brown", eyeColor: "brown", highlight: "hair" } },
  { en: "straight", ko: "곧은 (생머리)", emoji: "➖", ex: "She has straight hair.",
    face: { boy: false, hairLen: "long",  hairStyle: "straight", hairColor: "brown", eyeColor: "brown", highlight: "hair" } },
  { en: "curly",    ko: "곱슬곱슬한",   emoji: "➰", ex: "He has curly hair.",
    face: { boy: false, hairLen: "long",  hairStyle: "curly", hairColor: "brown", eyeColor: "brown", highlight: "hair" } },
];

/* ===== 🧑 신체 낱말 (필수: eyes/nose/hair/ears) ===== */
const BODY_WORDS = [
  { en: "eyes",  ko: "눈",       emoji: "👀", ex: "He has blue eyes.",
    face: { boy: true,  hairLen: "short", hairColor: "brown", eyeColor: "blue", eyeSize: "big", highlight: "eyes" } },
  { en: "nose",  ko: "코",       emoji: "👃", ex: "He has a big nose.",
    face: { boy: true,  hairLen: "short", hairColor: "brown", eyeColor: "brown", highlight: "nose" } },
  { en: "ears",  ko: "귀",       emoji: "👂", ex: "She has small ears.",
    face: { boy: true,  hairLen: "short", hairColor: "brown", eyeColor: "brown", earSize: "big", highlight: "ears" } },
  { en: "hair",  ko: "머리카락", emoji: "💇", ex: "She has long hair.",
    face: { boy: false, hairLen: "long", hairColor: "brown", eyeColor: "brown", highlight: "hair" } },
  { en: "mouth", ko: "입",       emoji: "👄", ex: "She has a small mouth.",
    face: { boy: true,  hairLen: "short", hairColor: "brown", eyeColor: "brown", highlight: "mouth" } },
  { en: "face",  ko: "얼굴",     emoji: "🙂", ex: "He has a round face.",
    face: { boy: false, hairLen: "long", hairColor: "brown", eyeColor: "brown", highlight: "face" } },
];

/* ===== 👗 옷·소품 낱말 (필수: dress/hat/glasses 등) =====
 * face: 그 옷·소품을 착용한 캐릭터 그림 */
const WEAR_WORDS = [
  { en: "dress",      ko: "드레스",        emoji: "👗", ex: "She's wearing a yellow dress.",
    face: { boy: false, hairLen: "long", hairColor: "brown", eyeColor: "brown", dress: "pink" } },
  { en: "hat",        ko: "모자",          emoji: "👒", ex: "She's wearing a hat.",
    face: { boy: false, hairLen: "long", hairColor: "brown", eyeColor: "brown", hat: "sun", hatColor: "yellow" } },
  { en: "cap",        ko: "야구 모자",     emoji: "🧢", ex: "He's wearing a blue cap.",
    face: { boy: true,  hairLen: "short", hairColor: "brown", eyeColor: "brown", hat: "cap", hatColor: "blue" } },
  { en: "cowboy hat", ko: "카우보이 모자", emoji: "🤠", ex: "He's wearing a cowboy hat.",
    face: { boy: true,  hairLen: "short", hairColor: "brown", eyeColor: "brown", hat: "cowboy" } },
  { en: "glasses",    ko: "안경",          emoji: "👓", ex: "He's wearing glasses.",
    face: { boy: true,  hairLen: "short", hairColor: "brown", eyeColor: "brown", glasses: true } },
  { en: "sunglasses", ko: "선글라스",      emoji: "🕶️", ex: "She's wearing sunglasses.",
    face: { boy: false, hairLen: "long", hairColor: "black", eyeColor: "brown", sunglasses: true } },
  { en: "mask",       ko: "마스크",        emoji: "😷", ex: "He's wearing a mask.",
    face: { boy: true,  hairLen: "short", hairColor: "black", eyeColor: "brown", mask: true } },
  { en: "boots",      ko: "부츠",          emoji: "👢", ex: "He's wearing boots.",
    face: { boy: true,  hairLen: "short", hairColor: "brown", eyeColor: "brown", boots: true, bootColor: "brown" } },
  { en: "helmet",     ko: "헬멧",          emoji: "⛑️", ex: "He's wearing a red helmet.",
    face: { boy: true,  hairLen: "short", hairColor: "black", eyeColor: "brown", hat: "helmet", hatColor: "red" } },
  { en: "braid",      ko: "땋은 머리",     emoji: "🎀", ex: "She has long hair in a braid.",
    face: { boy: false, hairLen: "long", hairColor: "blonde", eyeColor: "blue", braid: true } },
];

/* ===========================================================
 * 🧩 문장 만들기 데이터
 * =========================================================== */
const BUILD_SUBJECTS = [
  { en: "He",  ko: "그는",   boy: true,  emoji: "👦" },
  { en: "She", ko: "그녀는", boy: false, emoji: "👧" },
];

/* has ~ (신체) : 어떤 꾸밈말이 어울리는지 allow 로 표시 */
const BUILD_PARTS = [
  { key: "eyes", en: "eyes", koObj: "눈을",       emoji: "👀", plural: true,
    allow: { size: true, color: "eye" } },
  { key: "hair", en: "hair", koObj: "머리카락을", emoji: "💇",
    allow: { length: true, style: true, color: "hair" } },
  { key: "nose", en: "nose", koObj: "코를",       emoji: "👃", article: "a",
    allow: { size: true } },
  { key: "ears", en: "ears", koObj: "귀를",       emoji: "👂", plural: true,
    allow: { size: true } },
];

/* 꾸며 주는 말 */
const BUILD_ADJ_GROUPS = [
  { key: "size",   label: "📏 크기",   items: [
    { en: "big",   ko: "큰" },
    { en: "small", ko: "작은" },
  ]},
  { key: "length", label: "📐 길이",   items: [
    { en: "long",  ko: "긴" },
    { en: "short", ko: "짧은" },
  ]},
  { key: "style",  label: "〰️ 모양",   items: [
    { en: "straight", ko: "곧은" },
    { en: "curly",    ko: "곱슬곱슬한" },
  ]},
  { key: "color",  label: "🎨 색깔",   items: [
    { en: "blue",   ko: "파란" },
    { en: "green",  ko: "초록색" },
    { en: "brown",  ko: "갈색" },
    { en: "black",  ko: "까만" },
    { en: "gray",   ko: "회색" },
    { en: "yellow", ko: "노란" },
    { en: "blonde", ko: "금발" },
    { en: "red",    ko: "빨간" },
    { en: "purple", ko: "보라색" },
    { en: "pink",   ko: "분홍색" },
  ]},
];

/* 눈에 어울리는 색 / 머리에 어울리는 색 (검사용) */
const EYE_COLOR_OK  = ["blue", "green", "brown", "black", "gray"];
const HAIR_COLOR_OK = ["black", "brown", "blonde", "yellow", "red", "purple", "pink", "gray"];

/* is wearing ~ (옷·소품)
 * verb: 한국어 동사(입/쓰/끼/신) · plural: a 를 붙이지 않는 것
 * apply: 캐릭터 그림에 반영할 내용 */
const BUILD_ITEMS = [
  { key: "dress",   noun: "dress",      koObj: "드레스를",        verb: "입", emoji: "👗", color: true,  apply: { dress: true } },
  { key: "hat",     noun: "hat",        koObj: "모자를",          verb: "쓰", emoji: "👒", color: true,  apply: { hat: "sun" } },
  { key: "cap",     noun: "cap",        koObj: "야구 모자를",     verb: "쓰", emoji: "🧢", color: true,  apply: { hat: "cap" } },
  { key: "cowboy",  noun: "cowboy hat", koObj: "카우보이 모자를", verb: "쓰", emoji: "🤠", color: false, apply: { hat: "cowboy" } },
  { key: "helmet",  noun: "helmet",     koObj: "헬멧을",          verb: "쓰", emoji: "⛑️", color: true,  apply: { hat: "helmet" } },
  { key: "glasses", noun: "glasses",    koObj: "안경을",          verb: "쓰", emoji: "👓", color: false, plural: true, apply: { glasses: true } },
  { key: "sunglasses", noun: "sunglasses", koObj: "선글라스를",   verb: "끼", emoji: "🕶️", color: false, plural: true, apply: { sunglasses: true } },
  { key: "mask",    noun: "mask",       koObj: "마스크를",        verb: "쓰", emoji: "😷", color: true,  apply: { mask: true } },
  { key: "boots",   noun: "boots",      koObj: "부츠를",          verb: "신", emoji: "👢", color: true,  plural: true, apply: { boots: true } },
];

/* 옷·소품에 쓸 색깔 */
const ITEM_COLORS = [
  { en: "red",    ko: "빨간색" },
  { en: "orange", ko: "주황색" },
  { en: "yellow", ko: "노란색" },
  { en: "green",  ko: "초록색" },
  { en: "blue",   ko: "파란색" },
  { en: "purple", ko: "보라색" },
  { en: "pink",   ko: "분홍색" },
  { en: "brown",  ko: "갈색" },
  { en: "black",  ko: "까만" },
  { en: "white",  ko: "하얀색" },
];

/* ===========================================================
 * 🕵️ 누구게? 듣고 찾기 퀴즈 데이터 (무작위 생성 재료)
 * =========================================================== */
const QUIZ_HAIR_COLORS = ["black", "brown", "blonde", "red", "purple"];
const QUIZ_HAIR_COLOR_KO = { black: "검은", brown: "갈색", blonde: "금발", red: "빨간", purple: "보라색" };
const QUIZ_EYE_COLORS = ["blue", "brown", "green"];
const QUIZ_EYE_COLOR_KO = { blue: "파란", brown: "갈색", green: "초록색" };
const QUIZ_WEARS = [
  { key: "glasses",    en: "glasses",            ko: "안경을 쓰고",        apply: { glasses: true } },
  { key: "sunglasses", en: "sunglasses",         ko: "선글라스를 끼고",    apply: { sunglasses: true } },
  { key: "mask",       en: "a mask",             ko: "마스크를 쓰고",      apply: { mask: true } },
  { key: "redcap",     en: "a red cap",          ko: "빨간 야구 모자를 쓰고", apply: { hat: "cap", hatColor: "red" } },
  { key: "bluecap",    en: "a blue cap",         ko: "파란 야구 모자를 쓰고", apply: { hat: "cap", hatColor: "blue" } },
  { key: "yellowhat",  en: "a yellow hat",       ko: "노란 모자를 쓰고",   apply: { hat: "sun", hatColor: "yellow" } },
  { key: "pinkhat",    en: "a pink hat",         ko: "분홍 모자를 쓰고",   apply: { hat: "sun", hatColor: "pink" } },
  { key: "cowboy",     en: "a cowboy hat",       ko: "카우보이 모자를 쓰고", apply: { hat: "cowboy" } },
  { key: "helmet",     en: "a red helmet",       ko: "빨간 헬멧을 쓰고",   apply: { hat: "helmet", hatColor: "red" } },
  { key: "reddress",   en: "a red dress",        ko: "빨간 드레스를 입고", girlOnly: true, apply: { dress: "red" } },
  { key: "yellowdress", en: "a yellow dress",    ko: "노란 드레스를 입고", girlOnly: true, apply: { dress: "yellow" } },
];

/* ===== 단어 뜻 사전 ===== */
function wordKey(w) {
  return w.toLowerCase().replace(/^[^a-z']+/, "").replace(/[^a-z']+$/, "");
}

const WORD_MEANINGS = {
  "he": "그는, 그가",
  "she": "그녀는, 그녀가",
  "he's": "그는 ~이다/하고 있다 (He is)",
  "she's": "그녀는 ~이다/하고 있다 (She is)",
  "has": "~을 가지고 있다 (he/she + has)",
  "have": "~을 가지고 있다",
  "is": "~이다",
  "wearing": "입고/쓰고/끼고 있는 (wear+ing)",
  "wear": "입다, 쓰다, 착용하다",
  "and": "그리고, ~와",
  "a": "하나의",
  "an": "하나의",
  "in": "~안에 / (in a braid) 땋은 모양으로",
  "the": "그 (특정한 것)",
  "who": "누구",
  "what": "무엇",
  "eyes": "눈 (두 개라서 -s)",
  "eye": "눈 (한쪽)",
  "nose": "코",
  "ears": "귀 (두 개라서 -s)",
  "ear": "귀 (한쪽)",
  "hair": "머리카락",
  "mouth": "입",
  "face": "얼굴",
  "big": "큰",
  "small": "작은",
  "long": "긴",
  "short": "짧은",
  "straight": "곧은, 생머리의",
  "curly": "곱슬곱슬한",
  "round": "둥근",
  "braid": "땋은 머리 (머리묶음)",
  "red": "빨간, 빨간색",
  "orange": "주황색",
  "yellow": "노란, 노란색",
  "green": "초록색",
  "blue": "파란, 파란색",
  "purple": "보라색",
  "pink": "분홍색",
  "brown": "갈색",
  "black": "검은, 까만",
  "white": "하얀, 하얀색",
  "gray": "회색",
  "blonde": "금발의",
  "dark": "어두운 색의, 짙은",
  "gold": "금색",
  "metal": "금속",
  "dress": "드레스, 원피스",
  "hat": "모자",
  "cap": "(챙 달린) 야구 모자",
  "cowboy": "카우보이",
  "glasses": "안경",
  "sunglasses": "선글라스",
  "mask": "마스크",
  "boots": "부츠, 장화",
  "helmet": "헬멧",
  "sun": "해, 태양",
  "look": "보다; ~하게 보이다",
  "looks": "~하게 보이다",
  "like": "~처럼; 좋아하다",
  "it": "그것",
  "great": "훌륭한, 멋진",
  "job": "일 (Great job! 잘했어요!)",
};
