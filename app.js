/* =========================================================
 * 6단원 · He Has Blue Eyes! · 사람 묘사하기 웹 앱
 * - 음성 출력: Web Speech API (SpeechSynthesis)
 * - 단어 클릭: 단어 발음 + 뜻 풍선(popup)
 * - 캐릭터 그림: 문장 내용 그대로 SVG로 그려서 보여주기
 * - 문장 만들기: He/She + has/wearing 조합 → 검사 + 번역 + 듣기
 * - 누구게? 퀴즈: 설명을 듣고 알맞은 캐릭터 찾기
 * - 따라 말하기 채점: Web Speech API (SpeechRecognition)
 * ========================================================= */

/* ---------- 음성 합성 (TTS) ---------- */
const synth = window.speechSynthesis;
let enVoice = null;
let speakRate = 0.85;

function pickVoice() {
  const voices = synth.getVoices();
  enVoice =
    voices.find(v => /en[-_]US/i.test(v.lang)) ||
    voices.find(v => /^en/i.test(v.lang)) ||
    null;
  const status = document.querySelector(".toolbar #voice-status");
  if (status) {
    status.textContent = enVoice ? `음성: ${enVoice.name}` : "영어 음성을 찾는 중...";
  }
}
pickVoice();
if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = pickVoice;

function speak(text, rate, onStart, onEnd) {
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  u.rate = rate || speakRate;
  u.pitch = 1.05;
  if (enVoice) u.voice = enVoice;
  if (onStart) u.onstart = onStart;
  if (onEnd) u.onend = onEnd;
  synth.speak(u);
}

/* ---------- 단어 뜻 풍선(popup) ---------- */
const popup = document.createElement("div");
popup.className = "word-popup hidden";
popup.innerHTML = `
  <div class="wp-word"></div>
  <div class="wp-meaning"></div>
  <button class="wp-listen">단어 다시 듣기</button>`;
document.body.appendChild(popup);

popup.querySelector(".wp-listen").addEventListener("click", e => {
  e.stopPropagation();
  if (popup.dataset.word) speak(popup.dataset.word, 0.8);
});

function showWordPopup(wordEl, rawWord) {
  const key = wordKey(rawWord);
  const meaning = WORD_MEANINGS[key] || "(뜻 정보 없음)";
  popup.dataset.word = key || rawWord;
  popup.querySelector(".wp-word").textContent = rawWord.replace(/[.,!?]+$/, "");
  popup.querySelector(".wp-meaning").textContent = meaning;

  popup.classList.remove("hidden");
  const r = wordEl.getBoundingClientRect();
  const pw = popup.offsetWidth;
  let left = r.left + r.width / 2 - pw / 2 + window.scrollX;
  left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
  let top = r.bottom + 8 + window.scrollY;
  popup.style.left = left + "px";
  popup.style.top = top + "px";

  speak(key || rawWord, 0.8);
}

function hidePopup() { popup.classList.add("hidden"); }
document.addEventListener("click", e => {
  if (!popup.contains(e.target) && !e.target.classList.contains("word")) hidePopup();
});

/* ---------- 생김새 질문 (What does he/she look like?) ----------
 * 사람을 묘사하는 문장(He/She ~)이면 먼저 물어보는 질문을 만들어요. */
function isDescSentence(item) { return /^(He|She)\b/.test(item.en); }
function questionForItem(item) {
  if (!isDescSentence(item)) return null;
  const boy = item.face ? item.face.boy : /^He\b/.test(item.en);
  return boy ? "What does he look like?" : "What does she look like?";
}
/* 질문 → (잠깐 쉬고) → 대답 순서로 들려주기 */
function speakQA(question, en, div) {
  const on = () => div && div.classList.add("speaking");
  const off = () => div && div.classList.remove("speaking");
  if (!question) { speak(en, null, on, off); return; }
  speak(question, null, on, () => {
    setTimeout(() => speak(en, null, null, off), 220);
  });
}
/* 질문 배너 만들기 (누르면 질문만 다시 듣기) */
function makeQuestionEl(question) {
  const q = document.createElement("div");
  q.className = "card-question";
  q.innerHTML = `<span class="q-mark">Q.</span> ${question}`;
  q.addEventListener("click", e => { e.stopPropagation(); speak(question); });
  return q;
}

/* ---------- 클릭 가능한 단어로 문장 만들기 ---------- */
function buildWords(sentence) {
  const frag = document.createDocumentFragment();
  sentence.split(/\s+/).forEach((w, i) => {
    if (i > 0) frag.appendChild(document.createTextNode(" "));
    const span = document.createElement("span");
    span.className = "word";
    span.textContent = w;
    span.addEventListener("click", e => {
      e.stopPropagation();
      showWordPopup(span, w);
    });
    frag.appendChild(span);
  });
  return frag;
}

/* ===========================================================
 * 🧑‍🎨 캐릭터 SVG 그리기 (문장 내용과 똑같은 얼굴)
 * =========================================================== */
function cHex(name, fallback) {
  return COLOR_HEX[name] || name || fallback;
}

function faceSVG(f, bg) {
  f = f || {};
  const skin = f.skin || "#ffdcb8";
  const hairC = cHex(f.hairColor, "#8b5e34");
  const eyeC = cHex(f.eyeColor, "#8b5e34");
  const eyeK = f.eyeSize === "big" ? 1.35 : f.eyeSize === "small" ? 0.68 : 1;
  const earR = f.earSize === "big" ? 16 : f.earSize === "small" ? 6 : 10;
  const noseK = f.noseSize === "big" ? 1.75 : f.noseSize === "small" ? 0.6 : 1;
  const longHair = f.hairLen === "long";
  const curly = f.hairStyle === "curly";
  const p = [];

  // 뒷머리 (긴 머리)
  if (longHair) {
    if (curly) {
      [[60, 72], [48, 98], [46, 126], [52, 152], [148, 152], [154, 126], [152, 98], [140, 72]]
        .forEach(c => p.push(`<circle cx="${c[0]}" cy="${c[1]}" r="17" fill="${hairC}"/>`));
    } else {
      p.push(`<path d="M56,80 Q56,42 100,42 Q144,42 144,80 L150,166 Q126,178 100,178 Q74,178 50,166 Z" fill="${hairC}"/>`);
    }
  }

  // 몸 (드레스 또는 티셔츠)
  if (f.dress) {
    const dC = f.dress === true ? "#f472b6" : cHex(f.dress);
    p.push(`<path d="M76,150 L124,150 L146,219 L54,219 Z" fill="${dC}" stroke="rgba(0,0,0,0.1)" stroke-width="1.5"/>`);
    p.push(`<path d="M88,150 Q100,160 112,150 L112,158 Q100,168 88,158 Z" fill="rgba(255,255,255,0.55)"/>`);
  } else {
    const sC = (f.shirt && f.shirt !== true) ? cHex(f.shirt) : (f.boy === false ? "#f9a8d4" : "#7dd3fc");
    p.push(`<path d="M66,156 Q100,142 134,156 L140,219 L60,219 Z" fill="${sC}" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/>`);
  }

  // 목
  p.push(`<rect x="90" y="126" width="20" height="26" rx="8" fill="${skin}"/>`);

  // 귀 (머리 원이 안쪽 반을 덮음)
  p.push(`<circle cx="54" cy="98" r="${earR}" fill="${skin}" stroke="rgba(0,0,0,0.1)"/>`);
  p.push(`<circle cx="146" cy="98" r="${earR}" fill="${skin}" stroke="rgba(0,0,0,0.1)"/>`);

  // 얼굴
  p.push(`<circle cx="100" cy="96" r="46" fill="${skin}" stroke="rgba(0,0,0,0.07)" stroke-width="1.5"/>`);

  // 앞머리
  if (curly) {
    [[64, 72], [79, 58], [100, 52], [121, 58], [136, 72]]
      .forEach(c => p.push(`<circle cx="${c[0]}" cy="${c[1]}" r="14" fill="${hairC}"/>`));
    if (!longHair) {
      p.push(`<circle cx="56" cy="90" r="11" fill="${hairC}"/>`);
      p.push(`<circle cx="144" cy="90" r="11" fill="${hairC}"/>`);
    }
  } else {
    p.push(`<path d="M54,96 A46,46 0 0 1 146,96 Q100,72 54,96 Z" fill="${hairC}"/>`);
    if (!longHair) {
      p.push(`<path d="M54,96 Q50,82 58,72 L62,96 Z" fill="${hairC}"/>`);
      p.push(`<path d="M146,96 Q150,82 142,72 L138,96 Z" fill="${hairC}"/>`);
    }
  }

  // 땋은 머리
  if (f.braid) {
    p.push(`<circle cx="150" cy="118" r="9" fill="${hairC}"/>`);
    p.push(`<circle cx="152" cy="134" r="8" fill="${hairC}"/>`);
    p.push(`<circle cx="153" cy="149" r="7" fill="${hairC}"/>`);
    p.push(`<circle cx="153" cy="160" r="4" fill="#f43f5e"/>`);
  }

  // 눈 (흰자 + 눈동자 + 반짝임)
  [81, 119].forEach(x => {
    p.push(`<circle cx="${x}" cy="94" r="${8.5 * eyeK}" fill="#fff" stroke="#d6d3d1"/>`);
    p.push(`<circle cx="${x}" cy="94" r="${5 * eyeK}" fill="${eyeC}"/>`);
    p.push(`<circle cx="${x}" cy="94" r="${2.3 * eyeK}" fill="#292524"/>`);
    p.push(`<circle cx="${x + 2.4 * eyeK}" cy="${94 - 2.6 * eyeK}" r="${1.6 * eyeK}" fill="#fff"/>`);
  });

  // 볼터치
  p.push(`<circle cx="70" cy="112" r="5.5" fill="#fda4af" opacity="0.5"/>`);
  p.push(`<circle cx="130" cy="112" r="5.5" fill="#fda4af" opacity="0.5"/>`);

  // 코 + 입
  p.push(`<ellipse cx="100" cy="112" rx="${4.6 * noseK}" ry="${6.4 * noseK}" fill="#f3ba8b" stroke="rgba(0,0,0,0.06)"/>`);
  p.push(`<path d="M86,124 Q100,136 114,124" fill="none" stroke="#c2410c" stroke-width="3" stroke-linecap="round"/>`);

  // 마스크 (코·입 가리기)
  if (f.mask) {
    const mC = f.maskColor ? cHex(f.maskColor) : "#bfdbfe";
    p.push(`<path d="M70,103 Q100,97 130,103 L127,131 Q100,141 73,131 Z" fill="${mC}" stroke="rgba(0,0,0,0.12)" stroke-width="1.5"/>`);
    p.push(`<line x1="71" y1="106" x2="54" y2="98" stroke="${mC}" stroke-width="3"/>`);
    p.push(`<line x1="129" y1="106" x2="146" y2="98" stroke="${mC}" stroke-width="3"/>`);
  }

  // 안경 / 선글라스
  if (f.glasses || f.sunglasses) {
    const lens = f.sunglasses ? `fill="#1f2937" opacity="0.92"` : `fill="none"`;
    const frame = f.sunglasses ? "#374151" : cHex(f.glassesColor, "#374151");
    p.push(`<circle cx="81" cy="94" r="13" ${lens} stroke="${frame}" stroke-width="3"/>`);
    p.push(`<circle cx="119" cy="94" r="13" ${lens} stroke="${frame}" stroke-width="3"/>`);
    p.push(`<line x1="94" y1="94" x2="106" y2="94" stroke="${frame}" stroke-width="3"/>`);
    p.push(`<line x1="68" y1="92" x2="54" y2="90" stroke="${frame}" stroke-width="3"/>`);
    p.push(`<line x1="132" y1="92" x2="146" y2="90" stroke="${frame}" stroke-width="3"/>`);
  }

  // 모자류 (머리 위에 그려서 앞머리를 덮음)
  if (f.hat === "cap") {
    const hC = cHex(f.hatColor, "#3b82f6");
    p.push(`<path d="M60,78 A40,32 0 0 1 140,78 Z" fill="${hC}" stroke="rgba(0,0,0,0.12)"/>`);
    p.push(`<ellipse cx="129" cy="78" rx="27" ry="6.5" fill="${hC}" stroke="rgba(0,0,0,0.12)"/>`);
    p.push(`<circle cx="100" cy="50" r="4" fill="rgba(0,0,0,0.2)"/>`);
  } else if (f.hat === "cowboy") {
    p.push(`<ellipse cx="100" cy="72" rx="58" ry="13" fill="#a3672d" stroke="#7c4a1e" stroke-width="2"/>`);
    p.push(`<path d="M74,72 Q74,34 100,34 Q126,34 126,72 Z" fill="#a3672d" stroke="#7c4a1e" stroke-width="2"/>`);
    p.push(`<rect x="74" y="62" width="52" height="9" fill="#7c4a1e"/>`);
  } else if (f.hat === "sun") {
    const hC = cHex(f.hatColor, "#fbbf24");
    p.push(`<ellipse cx="100" cy="76" rx="57" ry="13" fill="${hC}" stroke="rgba(0,0,0,0.12)"/>`);
    p.push(`<path d="M66,76 A34,30 0 0 1 134,76 Z" fill="${hC}" stroke="rgba(0,0,0,0.12)"/>`);
    p.push(`<rect x="66" y="66" width="68" height="9" rx="4" fill="rgba(0,0,0,0.16)"/>`);
  } else if (f.hat === "helmet") {
    const hC = cHex(f.hatColor, "#ef4444");
    p.push(`<path d="M54,86 A46,44 0 0 1 146,86 Z" fill="${hC}" stroke="rgba(0,0,0,0.15)" stroke-width="2"/>`);
    p.push(`<rect x="92" y="44" width="16" height="44" rx="7" fill="${COLOR_HEX.gold}"/>`);
    p.push(`<rect x="54" y="80" width="92" height="9" rx="4" fill="${COLOR_HEX.gold}"/>`);
  }

  // 부츠
  if (f.boots) {
    const bC = f.bootColor ? cHex(f.bootColor) : "#7c4a1e";
    p.push(`<path d="M92,196 L92,212 L64,212 L64,206 Q64,199 74,199 L78,199 L78,196 Z" fill="${bC}"/>`);
    p.push(`<path d="M108,196 L108,212 L136,212 L136,206 Q136,199 126,199 L122,199 L122,196 Z" fill="${bC}"/>`);
  }

  // 강조 표시 (낱말 카드에서 "이 부분!" 하고 짚어주기)
  if (f.highlight) {
    const glow = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fb923c" opacity="0.16"/>`;
    const ring = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#f97316" stroke-width="3.5" stroke-dasharray="6 5" opacity="0.95"/>`;
    const spec = {
      eyes:  [100, 94, 41, 18],
      nose:  [100, 113, 13, 17],
      hair:  [100, 62, 56, 34],
      mouth: [100, 127, 23, 12],
      face:  [100, 98, 54, 56],
    };
    if (f.highlight === "ears") {
      p.push(glow(54, 98, 15, 15), glow(146, 98, 15, 15));
      p.push(ring(54, 98, 14, 14), ring(146, 98, 14, 14));
    } else if (spec[f.highlight]) {
      const s = spec[f.highlight];
      p.push(glow(s[0], s[1], s[2], s[3]), ring(s[0], s[1], s[2], s[3]));
    }
  }

  return `<svg class="face-svg" viewBox="0 0 200 222" role="img" aria-label="캐릭터 그림">
    <rect x="0" y="0" width="200" height="222" rx="18" fill="${bg || "#f0f9ff"}"/>
    ${p.join("")}
  </svg>`;
}

/* 카드의 그림 영역 만들기 (캐릭터 > 색 견본 > 이모지 순서) */
const FACE_BGS = ["#eff8ff", "#fffbeb", "#fff1f0", "#f0fdf4", "#f5f3ff", "#fdf2f8"];
function makeVisual(item, toneIdx) {
  if (item.face) {
    const div = document.createElement("div");
    div.className = "face-visual";
    div.innerHTML = faceSVG(item.face, FACE_BGS[(toneIdx || 0) % FACE_BGS.length]);
    return div;
  }
  if (item.swatch) {
    const div = document.createElement("div");
    div.className = "swatch-wrap";
    const sw = document.createElement("div");
    sw.className = "swatch";
    sw.style.background = item.swatch;
    div.appendChild(sw);
    return div;
  }
  const em = document.createElement("div");
  em.className = "emoji";
  em.textContent = item.emoji || "🙂";
  return em;
}

/* ---------- 카드 만들기 ---------- */
function makeCard(item, opts) {
  opts = opts || {};
  const div = document.createElement("div");
  div.className = "card" + (opts.tone != null ? " tone-" + opts.tone : "");

  const question = questionForItem(item);
  function speakSentence() { speakQA(question, item.en, div); }
  // 묘사 문장 카드는 어디를 눌러도 "질문 → 대답"이 들려요
  // (스스로 확인 모드로 가려져 있으면 질문만 들려줘 스스로 말해보게 함)
  if (question) {
    div.classList.add("clickable");
    div.addEventListener("click", () => {
      if (div.dataset.covered === "1") speak(question);
      else speakSentence();
    });
  }

  // 윗줄: 태그 + 듣기
  const top = document.createElement("div");
  top.className = "card-top";
  const tag = document.createElement("span");
  tag.className = "card-tag";
  if (opts.index != null) tag.textContent = "CARD " + opts.index;
  const listenAll = document.createElement("button");
  listenAll.className = "listen-all";
  listenAll.textContent = "듣기 ▶";
  listenAll.addEventListener("click", e => { e.stopPropagation(); speakSentence(); });
  top.append(tag, listenAll);

  const visual = makeVisual(item, opts.tone);

  // 안쪽 문장 박스: 문장 + 한글 + 스피커
  const box = document.createElement("div");
  box.className = "sentence-box";
  const txt = document.createElement("div");
  txt.className = "sentence-text";
  const en = document.createElement("div");
  en.className = "en";
  en.appendChild(buildWords(item.en));
  const ko = document.createElement("div");
  ko.className = "ko";
  ko.textContent = item.ko;
  txt.append(en, ko);
  // 단어 → 문장 다리: 이 단어로 만든 예문
  if (item.ex) {
    const ex = document.createElement("div");
    ex.className = "card-ex";
    const sen = document.createElement("span");
    sen.className = "ex-sen";
    sen.appendChild(buildWords(item.ex));
    const play = document.createElement("button");
    play.className = "ex-play";
    play.textContent = "예문 ▶";
    play.setAttribute("aria-label", "예문 듣기");
    play.addEventListener("click", e => { e.stopPropagation(); speak(item.ex); });
    ex.append(sen, play);
    txt.append(ex);
  }
  const speakBtn = document.createElement("button");
  speakBtn.className = "speak-btn";
  speakBtn.setAttribute("aria-label", "문장 듣기");
  speakBtn.textContent = "🔊";
  speakBtn.addEventListener("click", e => { e.stopPropagation(); speakSentence(); });
  box.append(txt, speakBtn);

  div.append(top, visual);
  if (question) div.append(makeQuestionEl(question));
  div.append(box);

  // 🙈 스스로 확인 모드: 정답(문장)을 가리고 그림+질문만 보고 말해보게 하기
  if (opts.cover && question) {
    box.style.display = "none";
    div.dataset.covered = "1";
    const cover = document.createElement("div");
    cover.className = "answer-cover";
    const t = document.createElement("div");
    t.className = "cover-text";
    t.innerHTML = "🙈 그림과 질문을 보고<br><b>문장을 말해 보세요!</b>";
    const reveal = document.createElement("button");
    reveal.className = "reveal-btn";
    reveal.textContent = "정답 확인 👀";
    reveal.addEventListener("click", e => {
      e.stopPropagation();
      box.style.display = "";
      div.dataset.covered = "0";
      cover.remove();
      speakSentence();
    });
    cover.append(t, reveal);
    div.append(cover);
  }

  // ⭐ 연습 목록 담기 버튼
  if (opts.selectable) {
    const sel = document.createElement("button");
    sel.className = "select-btn";
    const on = isSelected(item.en);
    sel.classList.toggle("on", on);
    sel.textContent = on ? "✓ 연습 목록에 있음" : "⭐ 연습 목록에 추가";
    sel.addEventListener("click", e => {
      e.stopPropagation();
      toggleSelect(item, opts.selectType || "suggest");
    });
    div.append(sel);
  }
  return div;
}

function renderGrid(id, list, opts) {
  opts = opts || {};
  const grid = document.getElementById(id);
  grid.innerHTML = "";
  list.forEach((item, i) => {
    const cardOpts = {};
    if (opts.tones) { cardOpts.tone = i % 6; if (!opts.noIndex) cardOpts.index = i + 1; }
    if (opts.selectable) { cardOpts.selectable = true; cardOpts.selectType = opts.selectType; }
    if (opts.cover) cardOpts.cover = true;
    grid.appendChild(makeCard(item, cardOpts));
  });
}

/* ---------- 난이도(초급/중급/고급) + 묘사 종류 ---------- */
let currentLevel = "beginner";
let currentCategory = "all";
let studyHide = false;   // 🙈 스스로 확인 모드 (문장 가리기)

function renderSuggestions() {
  const lvl = DESC_LEVELS[currentLevel];
  const view = [];
  lvl.forEach((item, i) => {
    if (currentCategory === "all" || DESC_CATEGORIES[i] === currentCategory) {
      view.push(Object.assign({}, item, { face: DESC_FACES[i] }));
    }
  });
  renderGrid("suggestion-grid", view, { tones: true, selectable: true, cover: studyHide });
}

/* 🙈 스스로 확인 모드 토글 */
const studyToggleBtn = document.getElementById("study-toggle");
if (studyToggleBtn) {
  studyToggleBtn.addEventListener("click", () => {
    studyHide = !studyHide;
    studyToggleBtn.classList.toggle("on", studyHide);
    studyToggleBtn.textContent = studyHide ? "👀 문장 다시 보기" : "🙈 문장 가리고 스스로 말하기";
    synth.cancel();
    hidePopup();
    renderSuggestions();
  });
}

document.querySelectorAll(".level-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".level-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentLevel = btn.dataset.level;
    synth.cancel();
    hidePopup();
    renderSuggestions();
  });
});

document.querySelectorAll(".cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.cat;
    synth.cancel();
    hidePopup();
    renderSuggestions();
  });
});

/* ===========================================================
 * 🧩 문장 만들기 (He/She + has ~ / is wearing ~)
 * =========================================================== */
let mlBoy = false;           // 주어: false=She, true=He
let mlPart = null;           // BUILD_PARTS 항목 (신체)
let mlAdjs = {};             // { size,length,style,color } (영어값)
let mlWearOn = false;        // 옷차림 문장 켜짐?
let mlItem = null;           // BUILD_ITEMS 항목
let mlItemColor = null;      // { en, ko }
let lastBuilt = "";          // 마지막으로 들려준 문장 (중복 재생 방지)

function makeChip(text, cls, isOn, onClick) {
  const c = document.createElement("button");
  c.className = "chip " + cls + (isOn ? " on" : "");
  c.textContent = text;
  c.addEventListener("click", onClick);
  return c;
}
function adjKo(groupKey, en) {
  const g = BUILD_ADJ_GROUPS.find(x => x.key === groupKey);
  const it = g && g.items.find(x => x.en === en);
  return it ? it.ko : en;
}
function colorLabel(en) {
  const g = BUILD_ADJ_GROUPS.find(x => x.key === "color");
  const it = g && g.items.find(x => x.en === en);
  return it ? `${en} (${it.ko})` : en;
}
function mlSubj() { return BUILD_SUBJECTS.find(s => s.boy === mlBoy) || BUILD_SUBJECTS[0]; }
function randOf(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* 부위별로 어울리는 형용사 슬롯만 정의 (→ 어색한 조합 자체가 안 생김) */
function partSlots(part) {
  if (!part) return [];
  if (part.key === "eyes") return [
    { key: "size",  label: "크기", group: "size" },
    { key: "color", label: "색깔", group: "color", pool: EYE_COLOR_OK },
  ];
  if (part.key === "hair") return [
    { key: "length", label: "길이", group: "length" },
    { key: "style",  label: "모양", group: "style" },
    { key: "color",  label: "색깔", group: "color", pool: HAIR_COLOR_OK },
  ];
  return [{ key: "size", label: "크기", group: "size" }]; // nose / ears
}

/* ---------- 빈칸 팝업(슬롯 고르기) ---------- */
const mlPop = document.createElement("div");
mlPop.className = "ml-pop hidden";
document.body.appendChild(mlPop);
function closeMlPop() { mlPop.classList.add("hidden"); mlPop.innerHTML = ""; }
document.addEventListener("click", e => {
  if (!mlPop.contains(e.target) && !e.target.closest(".ml-slot")) closeMlPop();
});
function openSlot(anchor, title, options, current, onPick, onClear) {
  mlPop.innerHTML = "";
  const t = document.createElement("div");
  t.className = "ml-pop-title";
  t.textContent = title;
  mlPop.appendChild(t);
  const grid = document.createElement("div");
  grid.className = "ml-pop-grid";
  options.forEach(o => {
    const b = document.createElement("button");
    b.className = "ml-opt" + (current === o.value ? " on" : "");
    if (o.swatch) {
      const s = document.createElement("span");
      s.className = "ml-sw"; s.style.background = o.swatch;
      b.appendChild(s);
    }
    b.appendChild(document.createTextNode(o.label));
    b.addEventListener("click", ev => { ev.stopPropagation(); onPick(o.value); closeMlPop(); });
    grid.appendChild(b);
  });
  mlPop.appendChild(grid);
  if (onClear && current != null) {
    const c = document.createElement("button");
    c.className = "ml-clear"; c.textContent = "이 빈칸 지우기 ✕";
    c.addEventListener("click", ev => { ev.stopPropagation(); onClear(); closeMlPop(); });
    mlPop.appendChild(c);
  }
  mlPop.classList.remove("hidden");
  const r = anchor.getBoundingClientRect();
  const pw = mlPop.offsetWidth;
  let left = r.left + r.width / 2 - pw / 2 + window.scrollX;
  left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
  mlPop.style.left = left + "px";
  mlPop.style.top = (r.bottom + 8 + window.scrollY) + "px";
}

/* 빈칸(슬롯) 버튼 */
function slotBtn(filled, placeholder, cls, onClick) {
  const s = document.createElement("button");
  s.className = "ml-slot " + cls + (filled ? " filled" : "");
  s.textContent = filled || placeholder;
  s.addEventListener("click", e => { e.stopPropagation(); onClick(s); });
  return s;
}
function wordSpan(text) {
  const w = document.createElement("span");
  w.className = "ml-w"; w.textContent = text;
  return w;
}

function renderMadlib() {
  // 누구
  const subjRow = document.getElementById("ml-subject");
  subjRow.innerHTML = "";
  BUILD_SUBJECTS.forEach(sub => {
    subjRow.appendChild(makeChip(`${sub.emoji} ${sub.en} (${sub.ko})`, "act", mlBoy === sub.boy, () => {
      mlBoy = sub.boy; renderMadlib(); updateBuildResult();
    }));
  });

  const lines = document.getElementById("ml-lines");
  lines.innerHTML = "";
  const subjEn = mlBoy ? "He" : "She";

  /* ===== 🙌 has 줄 ===== */
  const l1 = document.createElement("div");
  l1.className = "ml-line";
  const k1 = document.createElement("span"); k1.className = "ml-key has"; k1.textContent = "🙌 has";
  l1.append(k1, wordSpan(`${subjEn} has`));

  if (!mlPart) {
    l1.appendChild(slotBtn(null, "＋ 눈·코·머리·귀", "slot-part", (a) => {
      openSlot(a, "어디를 묘사할까요?",
        BUILD_PARTS.map(p => ({ value: p.key, label: `${p.emoji} ${p.en}` })), null,
        (v) => { mlPart = BUILD_PARTS.find(p => p.key === v); mlAdjs = {}; renderMadlib(); updateBuildResult(); });
    }));
  } else {
    partSlots(mlPart).forEach(sl => {
      const cur = mlAdjs[sl.key] || null;
      l1.appendChild(slotBtn(cur, `[${sl.label}]`, "slot-adj", (a) => {
        let opts;
        if (sl.group === "color") opts = sl.pool.map(c => ({ value: c, label: colorLabel(c), swatch: COLOR_HEX[c] }));
        else {
          const g = BUILD_ADJ_GROUPS.find(x => x.key === sl.group);
          opts = g.items.map(x => ({ value: x.en, label: `${x.en} (${x.ko})` }));
        }
        openSlot(a, `${sl.label} 고르기`, opts, cur,
          (v) => { mlAdjs[sl.key] = v; renderMadlib(); updateBuildResult(); },
          () => { delete mlAdjs[sl.key]; renderMadlib(); updateBuildResult(); });
      }));
    });
    const partChip = document.createElement("button");
    partChip.className = "ml-slot slot-part filled";
    partChip.innerHTML = `${mlPart.emoji} ${mlPart.en} <span class="ml-x">✕</span>`;
    partChip.addEventListener("click", e => {
      e.stopPropagation();
      openSlot(partChip, "어디를 묘사할까요?",
        BUILD_PARTS.map(p => ({ value: p.key, label: `${p.emoji} ${p.en}` })), mlPart.key,
        (v) => { mlPart = BUILD_PARTS.find(p => p.key === v); mlAdjs = {}; renderMadlib(); updateBuildResult(); });
    });
    l1.appendChild(partChip);
  }
  l1.appendChild(wordSpan("."));
  lines.appendChild(l1);

  /* ===== 👕 wearing 줄 ===== */
  if (!mlWearOn) {
    const add = document.createElement("button");
    add.className = "ml-add";
    add.textContent = "＋ 옷차림 문장도 만들기 (is wearing ~)";
    add.addEventListener("click", () => { mlWearOn = true; renderMadlib(); updateBuildResult(); });
    lines.appendChild(add);
  } else {
    const l2 = document.createElement("div");
    l2.className = "ml-line";
    const k2 = document.createElement("span"); k2.className = "ml-key wear"; k2.textContent = "👕 wearing";
    l2.append(k2, wordSpan(`${subjEn}'s wearing`));

    if (!mlItem) {
      l2.appendChild(slotBtn(null, "＋ 옷·소품", "slot-part", (a) => {
        openSlot(a, "무엇을 입고/쓰고 있나요?",
          BUILD_ITEMS.map(it => ({ value: it.key, label: `${it.emoji} ${it.noun}` })), null,
          (v) => { mlItem = BUILD_ITEMS.find(it => it.key === v); if (mlItem && !mlItem.color) mlItemColor = null; renderMadlib(); updateBuildResult(); });
      }));
    } else {
      if (!mlItem.plural) l2.appendChild(wordSpan("a"));
      if (mlItem.color) {
        const cur = mlItemColor ? mlItemColor.en : null;
        l2.appendChild(slotBtn(cur, "[색깔]", "slot-adj", (a) => {
          openSlot(a, "색깔 고르기",
            ITEM_COLORS.map(c => ({ value: c.en, label: `${c.en} (${c.ko})`, swatch: COLOR_HEX[c.en] })), cur,
            (v) => { mlItemColor = ITEM_COLORS.find(c => c.en === v); renderMadlib(); updateBuildResult(); },
            () => { mlItemColor = null; renderMadlib(); updateBuildResult(); });
        }));
      }
      const itemChip = document.createElement("button");
      itemChip.className = "ml-slot slot-part filled";
      itemChip.innerHTML = `${mlItem.emoji} ${mlItem.noun} <span class="ml-x">✕</span>`;
      itemChip.addEventListener("click", e => {
        e.stopPropagation();
        openSlot(itemChip, "무엇을 입고/쓰고 있나요?",
          BUILD_ITEMS.map(it => ({ value: it.key, label: `${it.emoji} ${it.noun}` })), mlItem.key,
          (v) => { mlItem = BUILD_ITEMS.find(it => it.key === v); if (mlItem && !mlItem.color) mlItemColor = null; renderMadlib(); updateBuildResult(); });
      });
      l2.appendChild(itemChip);
    }
    l2.appendChild(wordSpan("."));
    lines.appendChild(l2);

    const rm = document.createElement("button");
    rm.className = "ml-remove";
    rm.textContent = "✕ 옷차림 문장 빼기";
    rm.addEventListener("click", () => { mlWearOn = false; mlItem = null; mlItemColor = null; renderMadlib(); updateBuildResult(); });
    lines.appendChild(rm);
  }
}

/* 고른 내용을 캐릭터 그림으로 */
function buildPreviewFace() {
  const f = {
    boy: mlBoy, hairLen: "short", hairStyle: "straight",
    hairColor: mlBoy ? "brown" : "black", eyeColor: "brown",
  };
  if (!mlBoy) f.hairLen = "long";
  if (mlPart) {
    if (mlPart.key === "eyes") {
      if (mlAdjs.size) f.eyeSize = mlAdjs.size;
      if (mlAdjs.color) f.eyeColor = mlAdjs.color;
    } else if (mlPart.key === "hair") {
      if (mlAdjs.length) f.hairLen = mlAdjs.length;
      if (mlAdjs.style) f.hairStyle = mlAdjs.style;
      if (mlAdjs.color) f.hairColor = mlAdjs.color;
    } else if (mlPart.key === "nose") {
      if (mlAdjs.size) f.noseSize = mlAdjs.size;
    } else if (mlPart.key === "ears") {
      if (mlAdjs.size) f.earSize = mlAdjs.size;
    }
  }
  if (mlWearOn && mlItem) {
    Object.assign(f, mlItem.apply);
    const col = mlItemColor ? mlItemColor.en : null;
    if (mlItem.apply.dress) f.dress = col || "pink";
    if (mlItem.apply.shirt) f.shirt = col || (f.boy ? "blue" : "pink");
    if (mlItem.apply.hat) f.hatColor = col || undefined;
    if (mlItem.apply.mask && col) f.maskColor = col;
    if (mlItem.apply.boots && col) f.bootColor = col;
    if (mlItem.key === "glasses" && col) f.glassesColor = col;
  }
  return f;
}

/* has 문장 → { en, ko } | { incomplete } */
function hasSentence() {
  if (!mlPart) return { incomplete: "part" };
  if (!Object.keys(mlAdjs).length) return { incomplete: "adj" };
  const subj = mlSubj();
  const adjEn = [mlAdjs.size || mlAdjs.length, mlAdjs.style, mlAdjs.color].filter(Boolean);
  const adjKoArr = [];
  if (mlAdjs.size) adjKoArr.push(adjKo("size", mlAdjs.size));
  if (mlAdjs.length) adjKoArr.push(adjKo("length", mlAdjs.length));
  if (mlAdjs.style) adjKoArr.push(adjKo("style", mlAdjs.style));
  if (mlAdjs.color) adjKoArr.push(adjKo("color", mlAdjs.color));
  const np = (mlPart.article ? mlPart.article + " " : "") + adjEn.join(" ") + " " + mlPart.en;
  return {
    en: `${subj.en} has ${np}.`,
    ko: `${subj.ko} ${adjKoArr.join(" ")} ${mlPart.koObj} 가지고 있어요.`,
  };
}

/* wearing 문장 → { en, ko } | { incomplete } */
function wearSentence() {
  if (!mlItem) return { incomplete: "item" };
  const subj = mlSubj();
  const colorEn = mlItemColor ? mlItemColor.en + " " : "";
  const np = (mlItem.plural ? "" : "a ") + colorEn + mlItem.noun;
  const koColor = mlItemColor ? mlItemColor.ko + " " : "";
  return {
    en: `${subj.en}'s wearing ${np}.`,
    ko: `${subj.ko} ${koColor}${mlItem.koObj} ${mlItem.verb}고 있어요.`,
  };
}

function buildEmpty(box, msg) {
  box.className = "build-result empty";
  box.textContent = msg;
  lastBuilt = "";
}

function updateBuildResult() {
  const box = document.getElementById("build-result");
  const h = hasSentence();
  const w = mlWearOn ? wearSentence() : { incomplete: "off" };
  const done = [];
  if (!h.incomplete) done.push(h);
  if (mlWearOn && !w.incomplete) done.push(w);

  if (!done.length) {
    if (mlPart && !Object.keys(mlAdjs).length)
      return buildEmpty(box, `크기·색깔 빈칸을 눌러 "${mlSubj().en} has ... ${mlPart.en}." 문장을 완성해요! 👆`);
    return buildEmpty(box, "빈칸 [ ]을 눌러 단어를 골라 문장을 완성해 보세요! 👆");
  }
  showGoodResult(box, done.map(p => p.en).join(" "), done.map(p => p.ko).join(" "));
}

function showGoodResult(box, en, ko) {
  box.className = "build-result ok";
  box.innerHTML = "";
  const subj = mlSubj();
  const question = subj.boy ? "What does he look like?" : "What does she look like?";

  const badge = document.createElement("div");
  badge.className = "br-badge";
  badge.textContent = "✅ 멋진 문장이에요!";

  const face = buildPreviewFace();
  const preview = document.createElement("div");
  preview.className = "br-preview";
  preview.innerHTML = faceSVG(face, "#ffffff");

  const qEl = document.createElement("div");
  qEl.className = "br-question";
  qEl.innerHTML = `<span class="q-mark">Q.</span> ${question}`;
  qEl.addEventListener("click", () => speak(question));

  const enEl = document.createElement("div");
  enEl.className = "br-sentence";
  enEl.appendChild(buildWords(en));

  const koEl = document.createElement("div");
  koEl.className = "br-ko";
  koEl.textContent = ko;

  const actions = document.createElement("div");
  actions.className = "br-actions";
  const listenBtn = document.createElement("button");
  listenBtn.className = "btn primary";
  listenBtn.textContent = "🔊 질문+대답 듣기";
  listenBtn.addEventListener("click", () => speakQA(question, en, null));

  const item = { en, ko, emoji: subj.emoji, face, type: "combo" };
  const starBtn = document.createElement("button");
  starBtn.className = "btn";
  const on = isSelected(en);
  starBtn.textContent = on ? "✓ 연습 목록에 있음" : "⭐ 연습 목록에 추가";
  starBtn.addEventListener("click", () => { toggleSelect(item, "combo"); updateBuildResult(); });

  actions.append(listenBtn, starBtn);
  box.append(badge, preview, qEl, enEl, koEl, actions);

  if (en !== lastBuilt) { lastBuilt = en; speakQA(question, en, null); }
}

document.getElementById("build-random").addEventListener("click", () => {
  mlBoy = Math.random() < 0.5;
  mlPart = randOf(BUILD_PARTS);
  mlAdjs = {};
  partSlots(mlPart).forEach(sl => {
    if (sl.group === "color") mlAdjs.color = randOf(sl.pool);
    else if (sl.group === "size") { if (Math.random() < 0.9) mlAdjs.size = randOf(BUILD_ADJ_GROUPS[0].items).en; }
    else if (sl.group === "length") mlAdjs.length = randOf(BUILD_ADJ_GROUPS[1].items).en;
    else if (sl.group === "style") { if (Math.random() < 0.55) mlAdjs.style = randOf(BUILD_ADJ_GROUPS[2].items).en; }
  });
  if (!Object.keys(mlAdjs).length) {
    const sl = partSlots(mlPart)[0];
    if (sl.group === "size") mlAdjs.size = randOf(BUILD_ADJ_GROUPS[0].items).en;
    else if (sl.group === "length") mlAdjs.length = randOf(BUILD_ADJ_GROUPS[1].items).en;
    else if (sl.group === "color") mlAdjs.color = randOf(sl.pool);
  }
  if (Math.random() < 0.5) {
    mlWearOn = true;
    mlItem = randOf(BUILD_ITEMS);
    mlItemColor = (mlItem.color && Math.random() < 0.8) ? randOf(ITEM_COLORS) : null;
  } else {
    mlWearOn = false; mlItem = null; mlItemColor = null;
  }
  closeMlPop();
  renderMadlib();
  updateBuildResult();
});

document.getElementById("build-clear").addEventListener("click", () => {
  mlPart = null; mlAdjs = {}; mlWearOn = false; mlItem = null; mlItemColor = null;
  synth.cancel();
  closeMlPop();
  renderMadlib();
  updateBuildResult();
});

/* ===========================================================
 * 내 문장 연습 (선택 → 말하기/녹음 → 정확도 → 연습 횟수)
 * =========================================================== */
let selected = new Map();
let stats = {};
try { (JSON.parse(localStorage.getItem("desc_selected") || "[]") || []).forEach(it => selected.set(it.en, it)); } catch (e) {}
try { stats = JSON.parse(localStorage.getItem("desc_stats") || "{}") || {}; } catch (e) {}

function persist() {
  try {
    localStorage.setItem("desc_selected", JSON.stringify([...selected.values()]));
    localStorage.setItem("desc_stats", JSON.stringify(stats));
  } catch (e) {}
}
function isSelected(en) { return selected.has(en); }
function toggleSelect(item, type) {
  if (selected.has(item.en)) selected.delete(item.en);
  else selected.set(item.en, { en: item.en, ko: item.ko, emoji: item.emoji, face: item.face, type: type || "suggest" });
  persist();
  updatePracticeBadge();
  renderSuggestions();
  if (document.getElementById("tab-practice").classList.contains("active")) renderPractice();
}
function updatePracticeBadge() {
  const c = document.getElementById("practice-count");
  if (c) c.textContent = selected.size;
}

/* ---- 음성 인식 (정확도 측정) ---- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const srSupported = !!SR;
let rec = srSupported ? new SR() : null;
if (rec) { rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 5; }
let recBusy = false;

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z\s']/g, "").replace(/\s+/g, " ").trim();
}
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
function wordsClose(a, b) {
  if (a === b) return true;
  if (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a))) return true;
  return Math.abs(a.length - b.length) <= 1 && levenshtein(a, b) <= 1;
}
const STOPWORDS = new Set(["a", "an", "the", "to", "of", "on", "in", "at", "for", "and", "he", "she", "he's", "she's", "is"]);
function scoreMatch(target, heard) {
  const t = normalize(target).split(" ").filter(Boolean);
  const h = normalize(heard).split(" ").filter(Boolean);
  let content = t.filter(w => !STOPWORDS.has(w));
  if (!content.length) content = t;
  let hit = 0;
  content.forEach(w => { if (h.some(x => wordsClose(x, w))) hit++; });
  let score = hit / content.length;
  if (score >= 0.5) score = Math.min(1, score + 0.12);
  return score;
}
function practiceAttempt(target, cb) {
  if (!rec || recBusy) { cb.onend && cb.onend(); return; }
  recBusy = true;
  let score = 0, heard = "", errCode = null;
  rec.onresult = e => {
    const alts = e.results[0];
    for (let i = 0; i < alts.length; i++) {
      const s = scoreMatch(target, alts[i].transcript);
      if (s > score) { score = s; heard = alts[i].transcript; }
    }
  };
  rec.onerror = ev => { errCode = ev.error; };
  rec.onend = () => {
    recBusy = false;
    if (errCode && score === 0) cb.onerror && cb.onerror(errCode);
    else cb.onresult && cb.onresult(Math.round(score * 100), heard);
    cb.onend && cb.onend();
  };
  try { rec.start(); } catch (e) { recBusy = false; cb.onend && cb.onend(); }
}

/* ---- 연습 카드 ---- */
function makePracticeCard(item) {
  const div = document.createElement("div");
  div.className = "card pcard";

  const top = document.createElement("div");
  top.className = "card-top";
  const tag = document.createElement("span");
  tag.className = "card-tag " + (item.type === "combo" ? "tag-combo" : "tag-suggest");
  tag.textContent = item.type === "combo" ? "🧩 내 문장" : "🙋 묘사 문장";
  const remove = document.createElement("button");
  remove.className = "premove";
  remove.setAttribute("aria-label", "목록에서 빼기");
  remove.textContent = "✕";
  remove.addEventListener("click", () => {
    selected.delete(item.en);
    persist();
    updatePracticeBadge();
    renderPractice();
    renderSuggestions();
  });
  top.append(tag, remove);

  const visual = makeVisual(item, 0);

  const box = document.createElement("div");
  box.className = "sentence-box";
  const txt = document.createElement("div");
  txt.className = "sentence-text";
  const en = document.createElement("div");
  en.className = "en";
  en.appendChild(buildWords(item.en));
  const ko = document.createElement("div");
  ko.className = "ko";
  ko.textContent = item.ko;
  txt.append(en, ko);
  const question = questionForItem(item);
  const speakBtn = document.createElement("button");
  speakBtn.className = "speak-btn";
  speakBtn.textContent = "🔊";
  speakBtn.addEventListener("click", e => { e.stopPropagation(); speakQA(question, item.en, div); });
  box.append(txt, speakBtn);

  const micArea = document.createElement("div");
  micArea.className = "mic-area";
  const mic = document.createElement("button");
  mic.className = "mic-btn";
  mic.setAttribute("aria-label", "말하기");
  mic.innerHTML = '<span class="mic-ico">🎙️</span>';
  const micLabel = document.createElement("div");
  micLabel.className = "mic-label";
  micLabel.textContent = "마이크를 누르고 말해보세요";
  micArea.append(mic, micLabel);

  const statsEl = document.createElement("div");
  statsEl.className = "pstats";
  const fb = document.createElement("div");
  fb.className = "mic-feedback";

  function renderStats(last) {
    const s = stats[item.en] || { attempts: 0, best: 0 };
    statsEl.innerHTML =
      `정확도 <b class="acc">${last != null ? last + "%" : "--"}</b>` +
      ` · 최고 <b class="best">${s.best ? s.best + "%" : "--"}</b>` +
      ` · 연습 <b>${s.attempts}</b>회`;
  }
  renderStats(null);

  if (!srSupported) { mic.disabled = true; mic.title = "이 브라우저는 음성 인식을 지원하지 않아요 (Chrome 권장)"; }

  mic.addEventListener("click", () => {
    if (recBusy || !srSupported) return;
    mic.classList.add("recording");
    micLabel.textContent = "🔴 녹음 중... 말해보세요";
    fb.textContent = "또박또박 말해보세요!";
    fb.className = "mic-feedback";
    practiceAttempt(item.en, {
      onresult: (score, heard) => {
        const s = stats[item.en] || { attempts: 0, best: 0 };
        s.attempts++;
        s.best = Math.max(s.best, score);
        stats[item.en] = s;
        persist();
        renderStats(score);
        if (score >= 75) { fb.className = "mic-feedback good"; fb.innerHTML = `⭐ 훌륭해요! (${score}%)<br><span class="heard">내가 한 발음: ${heard}</span>`; }
        else if (score >= 45) { fb.className = "mic-feedback good"; fb.innerHTML = `👍 좋아요! 한 번 더! (${score}%)<br><span class="heard">내가 한 발음: ${heard}</span>`; }
        else { fb.className = "mic-feedback bad"; fb.innerHTML = `🔁 다시 또박또박! (${score}%)<br><span class="heard">내가 한 발음: ${heard || "(못 들었어요)"}</span>`; }
      },
      onerror: err => {
        fb.className = "mic-feedback bad";
        fb.textContent = err === "not-allowed" ? "마이크 권한을 허용해 주세요." : "다시 시도해 주세요.";
      },
      onend: () => {
        mic.classList.remove("recording");
        micLabel.textContent = "마이크를 누르고 말해보세요";
      }
    });
  });

  div.append(top, visual);
  if (question) div.append(makeQuestionEl(question));
  div.append(box, micArea, statsEl, fb);
  return div;
}

function renderPractice() {
  const items = [...selected.values()];
  const empty = document.getElementById("practice-empty");
  const list = document.getElementById("practice-list");
  if (!items.length) { empty.style.display = "block"; list.innerHTML = ""; updatePracticeBadge(); return; }
  empty.style.display = "none";
  // 묘사 문장 먼저, 내가 만든 문장 다음으로 정렬
  items.sort((a, b) => (a.type === "combo" ? 1 : 0) - (b.type === "combo" ? 1 : 0));
  list.innerHTML = "";
  items.forEach(it => list.appendChild(makePracticeCard(it)));
  updatePracticeBadge();
}

/* ===========================================================
 * 🗂️ 학습지(정보 차) 활동 준비 모드
 * =========================================================== */
function charQuestion(ch) {
  return ch.face.boy ? "What does he look like?" : "What does she look like?";
}

/* 이 인물을 '문장 만들기(STEP 3)'에 그대로 불러오기 */
function loadBuildFromChar(ch) {
  const b = ch.build;
  mlBoy = b.boy;
  mlPart = b.part ? BUILD_PARTS.find(p => p.key === b.part) : null;
  mlAdjs = Object.assign({}, b.adjs || {});
  if (b.item) {
    mlWearOn = true;
    mlItem = BUILD_ITEMS.find(it => it.key === b.item) || null;
    mlItemColor = b.itemColor ? (ITEM_COLORS.find(c => c.en === b.itemColor) || null) : null;
  } else {
    mlWearOn = false; mlItem = null; mlItemColor = null;
  }
  closeMlPop();
  renderMadlib();
  updateBuildResult();
  const bt = document.querySelector('.tab-btn[data-tab="build"]');
  if (bt) bt.click();
}

/* 미션 카드 (활동지 인물 1명) */
function makeMissionCard(ch, idx) {
  const card = document.createElement("div");
  card.className = "card mission-card tone-" + (idx % 6);

  const top = document.createElement("div");
  top.className = "card-top";
  const tag = document.createElement("span");
  tag.className = "card-tag";
  tag.textContent = ch.n + "문장";
  top.appendChild(tag);

  const visual = document.createElement("div");
  visual.className = "face-visual";
  visual.innerHTML = faceSVG(ch.face, FACE_BGS[idx % FACE_BGS.length]);

  const hint = document.createElement("div");
  hint.className = "mission-hint";
  hint.innerHTML = `<span class="mh-label">힌트</span> ${ch.hintKo}`;

  const ansWrap = document.createElement("div");
  ansWrap.className = "mission-answer";
  const cover = document.createElement("button");
  cover.className = "reveal-btn small";
  cover.textContent = "정답 문장 확인 👀";
  const shown = document.createElement("div");
  shown.className = "mission-shown hidden";
  const q = document.createElement("div");
  q.className = "card-question";
  q.innerHTML = `<span class="q-mark">Q.</span> ${charQuestion(ch)}`;
  q.addEventListener("click", () => speak(charQuestion(ch)));
  const en = document.createElement("div"); en.className = "en"; en.appendChild(buildWords(ch.en));
  const ko = document.createElement("div"); ko.className = "ko"; ko.textContent = ch.ko;
  const listen = document.createElement("button");
  listen.className = "btn primary small";
  listen.textContent = "🔊 질문+대답 듣기";
  listen.addEventListener("click", () => speakQA(charQuestion(ch), ch.en, null));
  shown.append(q, en, ko, listen);
  cover.addEventListener("click", () => { shown.classList.remove("hidden"); cover.remove(); });
  ansWrap.append(cover, shown);

  const build = document.createElement("button");
  build.className = "btn ghost small mission-build";
  build.textContent = "🔨 문장 만들기로 만들기";
  build.addEventListener("click", () => loadBuildFromChar(ch));

  card.append(top, visual, hint, ansWrap, build);
  return card;
}

function renderActivity() {
  const grid = document.getElementById("activity-grid");
  if (grid && !grid.dataset.done) {
    grid.innerHTML = "";
    ACTIVITY_CHARS.forEach((ch, i) => grid.appendChild(makeMissionCard(ch, i)));
    grid.dataset.done = "1";
  }
}

/* 🎤 짝 대화 리허설: 앱이 묻고(“What does he/she look like?”), 내가 묘사 */
let rehearsalChar = null;
function pickRehearsal(doSpeak) {
  rehearsalChar = ACTIVITY_CHARS[Math.floor(Math.random() * ACTIVITY_CHARS.length)];
  const face = document.getElementById("reh-face");
  if (face) face.innerHTML = faceSVG(rehearsalChar.face, "#ffffff");
  const fb = document.getElementById("reh-feedback");
  if (fb) {
    fb.className = "reh-feedback";
    fb.textContent = doSpeak ? "🔊 질문을 듣고, 이 친구를 영어로 묘사해 보세요!" : "🎤 버튼을 눌러 이 친구를 영어로 묘사해 보세요!";
  }
  const a = document.getElementById("reh-answer");
  if (a) a.classList.add("hidden");
  if (doSpeak) speak(charQuestion(rehearsalChar));
}

/* 활동 탭 버튼 묶음 배선 (한 번만) */
document.querySelectorAll(".q-card-line").forEach(btn => {
  btn.addEventListener("click", () => speak(btn.dataset.say));
});
const rehMic = document.getElementById("reh-mic");
if (rehMic) {
  document.getElementById("reh-new").addEventListener("click", () => pickRehearsal(true));
  document.getElementById("reh-question").addEventListener("click", () => { if (rehearsalChar) speak(charQuestion(rehearsalChar)); });
  document.getElementById("reh-show").addEventListener("click", () => {
    if (!rehearsalChar) return;
    const a = document.getElementById("reh-answer");
    a.classList.remove("hidden");
    a.innerHTML = "";
    const en = document.createElement("div"); en.className = "en"; en.appendChild(buildWords(rehearsalChar.en));
    const ko = document.createElement("div"); ko.className = "ko"; ko.textContent = rehearsalChar.ko;
    a.append(en, ko);
  });
  if (!srSupported) { rehMic.disabled = true; rehMic.title = "이 브라우저는 음성 인식을 지원하지 않아요 (Chrome 권장)"; }
  rehMic.addEventListener("click", () => {
    if (!rehearsalChar || recBusy || !srSupported) return;
    rehMic.classList.add("recording");
    const fb = document.getElementById("reh-feedback");
    fb.className = "reh-feedback";
    fb.textContent = "🔴 녹음 중... 이 친구를 묘사해 보세요!";
    practiceAttempt(rehearsalChar.en, {
      onresult: (score, heard) => {
        if (score >= 60) { fb.className = "reh-feedback good"; fb.innerHTML = `⭐ 훌륭해요! (${score}%) 친구에게 이렇게 답하면 돼요!<br><span class="heard">내가 한 말: ${heard}</span>`; }
        else if (score >= 35) { fb.className = "reh-feedback good"; fb.innerHTML = `👍 좋아요! 한 번 더! (${score}%)<br><span class="heard">내가 한 말: ${heard}</span>`; }
        else { fb.className = "reh-feedback bad"; fb.innerHTML = `🔁 다시! <b>📖 정답 문장</b>을 보고 연습해요. (${score}%)<br><span class="heard">내가 한 말: ${heard || "(못 들었어요)"}</span>`; }
      },
      onerror: (err) => { fb.className = "reh-feedback bad"; fb.textContent = err === "not-allowed" ? "마이크 권한을 허용해 주세요." : "다시 시도해 주세요."; },
      onend: () => { rehMic.classList.remove("recording"); },
    });
  });
}

/* ---------- 헤더 미니 얼굴 퍼레이드 (장식) ---------- */
(function renderFaceParade() {
  const wrap = document.getElementById("face-parade");
  if (!wrap) return;
  const faces = [
    { boy: true,  hairLen: "short", hairStyle: "straight", hairColor: "brown",  eyeColor: "blue" },
    { boy: false, hairLen: "long",  hairStyle: "straight", hairColor: "blonde", eyeColor: "green", braid: true },
    { boy: true,  hairLen: "short", hairStyle: "curly",    hairColor: "black",  eyeColor: "brown", glasses: true },
    { boy: false, hairLen: "long",  hairStyle: "curly",    hairColor: "red",    eyeColor: "brown" },
    { boy: true,  hairLen: "short", hairStyle: "straight", hairColor: "black",  eyeColor: "brown", hat: "cap", hatColor: "red" },
  ];
  wrap.innerHTML = faces.map(f => faceSVG(f, "#ffffff")).join("");
})();

/* ---------- 초기 렌더 ---------- */
renderSuggestions();
renderGrid("color-grid", COLOR_WORDS, { tones: true, noIndex: true });
renderGrid("size-grid", SIZE_WORDS, { tones: true, noIndex: true });
renderGrid("body-grid", BODY_WORDS, { tones: true, noIndex: true });
renderGrid("wear-grid", WEAR_WORDS, { tones: true, noIndex: true });
renderMadlib();
updateBuildResult();
updatePracticeBadge();

/* ---------- 탭 전환 ---------- */
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    synth.cancel();
    hidePopup();
    if (btn.dataset.tab === "practice") renderPractice();
    if (btn.dataset.tab === "activity") { renderActivity(); if (!rehearsalChar) pickRehearsal(false); }
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

/* ---------- "다음 단계 ▶" 버튼 → 해당 STEP 탭으로 ---------- */
document.querySelectorAll(".next-step").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = document.querySelector(`.tab-btn[data-tab="${btn.dataset.next}"]`);
    if (target) target.click();
  });
});

/* ---------- 속도 조절 ---------- */
document.getElementById("rate").addEventListener("input", e => {
  speakRate = parseFloat(e.target.value);
});
