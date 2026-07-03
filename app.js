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
    const sC = f.shirt ? cHex(f.shirt) : (f.boy === false ? "#f9a8d4" : "#7dd3fc");
    p.push(`<path d="M66,156 Q100,142 134,156 L140,219 L60,219 Z" fill="${sC}" stroke="rgba(0,0,0,0.08)" stroke-width="1.5"/>`);
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
    p.push(`<circle cx="81" cy="94" r="13" ${lens} stroke="#374151" stroke-width="3"/>`);
    p.push(`<circle cx="119" cy="94" r="13" ${lens} stroke="#374151" stroke-width="3"/>`);
    p.push(`<line x1="94" y1="94" x2="106" y2="94" stroke="#374151" stroke-width="3"/>`);
    p.push(`<line x1="68" y1="92" x2="54" y2="90" stroke="#374151" stroke-width="3"/>`);
    p.push(`<line x1="132" y1="92" x2="146" y2="90" stroke="#374151" stroke-width="3"/>`);
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
  if (question) {
    div.classList.add("clickable");
    div.addEventListener("click", () => speakSentence());
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
  const speakBtn = document.createElement("button");
  speakBtn.className = "speak-btn";
  speakBtn.setAttribute("aria-label", "문장 듣기");
  speakBtn.textContent = "🔊";
  speakBtn.addEventListener("click", e => { e.stopPropagation(); speakSentence(); });
  box.append(txt, speakBtn);

  div.append(top, visual);
  if (question) div.append(makeQuestionEl(question));
  div.append(box);

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
    grid.appendChild(makeCard(item, cardOpts));
  });
}

/* ---------- 난이도(초급/중급/고급) + 묘사 종류 ---------- */
let currentLevel = "beginner";
let currentCategory = "all";

function renderSuggestions() {
  const lvl = DESC_LEVELS[currentLevel];
  const view = [];
  lvl.forEach((item, i) => {
    if (currentCategory === "all" || DESC_CATEGORIES[i] === currentCategory) {
      view.push(Object.assign({}, item, { face: DESC_FACES[i] }));
    }
  });
  renderGrid("suggestion-grid", view, { tones: true, selectable: true });
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
let buildSubject = BUILD_SUBJECTS[0];
let buildMode = "has";           // "has" | "wearing"
let buildPart = null;            // has: 신체 부위
let buildAdjs = {};              // has: { size, length, style, color } (en 값)
let buildItem = null;            // wearing: 옷·소품
let buildItemColor = null;       // wearing: 색 { en, ko }
let lastBuilt = "";              // 마지막으로 들려준 문장 (중복 재생 방지)

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

function renderBuilder() {
  const subjRow = document.getElementById("build-subject");
  const modeRow = document.getElementById("build-mode");
  const targetWrap = document.getElementById("build-target");
  const adjWrap = document.getElementById("build-adjs");
  subjRow.innerHTML = ""; modeRow.innerHTML = ""; targetWrap.innerHTML = ""; adjWrap.innerHTML = "";

  // 1️⃣ 누구
  BUILD_SUBJECTS.forEach(s => {
    subjRow.appendChild(makeChip(`${s.emoji} ${s.en} (${s.ko})`, "act", buildSubject === s, () => {
      buildSubject = s; renderBuilder(); updateBuildResult();
    }));
  });

  // 2️⃣ 무엇을 말할까
  [
    { key: "has", label: "🙌 has ~ (신체 묘사)" },
    { key: "wearing", label: "👕 is wearing ~ (입은 것)" },
  ].forEach(m => {
    modeRow.appendChild(makeChip(m.label, "when", buildMode === m.key, () => {
      buildMode = m.key; renderBuilder(); updateBuildResult();
    }));
  });

  if (buildMode === "has") {
    // 3️⃣ 신체 부위
    const title = document.createElement("div");
    title.className = "chip-group-title";
    title.textContent = "3️⃣ 어디를 묘사할까요? (신체)";
    const row = document.createElement("div");
    row.className = "chip-row";
    BUILD_PARTS.forEach(pt => {
      row.appendChild(makeChip(`${pt.emoji} ${pt.en}`, "act", buildPart === pt, () => {
        buildPart = pt; renderBuilder(); updateBuildResult();
      }));
    });
    targetWrap.append(title, row);

    // 4️⃣ 꾸며 주는 말 (크기·길이·모양·색깔 — 골라 보며 어울리는지 배워요)
    BUILD_ADJ_GROUPS.forEach(g => {
      const t = document.createElement("div");
      t.className = "chip-group-title";
      t.textContent = g.label;
      const r = document.createElement("div");
      r.className = "chip-row";
      g.items.forEach(a => {
        const on = buildAdjs[g.key] === a.en;
        r.appendChild(makeChip(`${a.en} (${a.ko})`, "where", on, () => {
          if (on) delete buildAdjs[g.key];
          else buildAdjs[g.key] = a.en;
          renderBuilder(); updateBuildResult();
        }));
      });
      adjWrap.append(t, r);
    });
  } else {
    // 3️⃣ 옷·소품
    const title = document.createElement("div");
    title.className = "chip-group-title";
    title.textContent = "3️⃣ 무엇을 입고/쓰고 있나요?";
    const row = document.createElement("div");
    row.className = "chip-row";
    BUILD_ITEMS.forEach(it => {
      row.appendChild(makeChip(`${it.emoji} ${it.noun}`, "act", buildItem === it, () => {
        buildItem = it; renderBuilder(); updateBuildResult();
      }));
    });
    targetWrap.append(title, row);

    // 4️⃣ 색깔 (선택)
    const t = document.createElement("div");
    t.className = "chip-group-title";
    t.textContent = "🎨 색깔 (골라도 되고 안 골라도 돼요)";
    const r = document.createElement("div");
    r.className = "chip-row";
    ITEM_COLORS.forEach(c => {
      const on = buildItemColor && buildItemColor.en === c.en;
      r.appendChild(makeChip(`${c.en} (${c.ko})`, "where", on, () => {
        buildItemColor = on ? null : c;
        renderBuilder(); updateBuildResult();
      }));
    });
    adjWrap.append(t, r);
  }
}

/* has 조합 검사: 어울리지 않는 꾸밈말이면 이유를 알려줘요 */
function checkHasCombo(part, adjs) {
  if (part.key !== "hair" && (adjs.length)) {
    return `<b>long / short</b>(길이)는 <b>hair</b>(머리카락)에 어울려요.<br>눈·코·귀에는 <b>big / small</b>을 써 보세요!`;
  }
  if (part.key !== "hair" && adjs.style) {
    return `<b>straight / curly</b>(곧은·곱슬)는 <b>hair</b>(머리카락)를 꾸밀 때만 써요!`;
  }
  if (part.key === "hair" && adjs.size) {
    return `머리카락의 길이는 big/small 대신 <b>long / short</b>로 말해요!`;
  }
  if (part.allow.color == null && adjs.color) {
    return `코와 귀는 색깔 대신 <b>크기(big / small)</b>로 묘사해요!`;
  }
  if (part.key === "eyes" && adjs.color && !EYE_COLOR_OK.includes(adjs.color)) {
    return `<b>${adjs.color}</b>는 머리카락 색으로 어울려요.<br>눈 색깔은 <b>blue · green · brown · black · gray</b>에서 골라 보세요!`;
  }
  if (part.key === "hair" && adjs.color && !HAIR_COLOR_OK.includes(adjs.color)) {
    return `<b>${adjs.color}</b>는 눈 색깔로 어울려요.<br>머리 색은 <b>black · brown · blonde · red…</b>에서 골라 보세요!`;
  }
  return null;
}

/* 고른 내용을 캐릭터 그림으로 */
function buildPreviewFace() {
  const f = {
    boy: buildSubject.boy,
    hairLen: "short", hairStyle: "straight",
    hairColor: buildSubject.boy ? "brown" : "black",
    eyeColor: "brown",
  };
  if (!buildSubject.boy) f.hairLen = "long";
  if (buildMode === "has" && buildPart) {
    if (buildPart.key === "eyes") {
      if (buildAdjs.size) f.eyeSize = buildAdjs.size;
      if (buildAdjs.color) f.eyeColor = buildAdjs.color;
    } else if (buildPart.key === "hair") {
      if (buildAdjs.length) f.hairLen = buildAdjs.length;
      if (buildAdjs.style) f.hairStyle = buildAdjs.style;
      if (buildAdjs.color) f.hairColor = buildAdjs.color;
    } else if (buildPart.key === "nose") {
      if (buildAdjs.size) f.noseSize = buildAdjs.size;
    } else if (buildPart.key === "ears") {
      if (buildAdjs.size) f.earSize = buildAdjs.size;
    }
  }
  if (buildMode === "wearing" && buildItem) {
    Object.assign(f, buildItem.apply);
    const col = buildItemColor ? buildItemColor.en : null;
    if (buildItem.apply.dress) f.dress = col || "pink";
    if (buildItem.apply.hat) f.hatColor = col || undefined;
    if (buildItem.apply.mask && col) f.maskColor = col;
    if (buildItem.apply.boots && col) f.bootColor = col;
  }
  return f;
}

function updateBuildResult() {
  const box = document.getElementById("build-result");

  /* --- has ~ --- */
  if (buildMode === "has") {
    if (!buildPart) {
      box.className = "build-result empty";
      box.textContent = "누구를 · 어디를 묘사할지 골라보세요! 👆";
      lastBuilt = "";
      return;
    }
    const chosen = Object.keys(buildAdjs);
    if (!chosen.length) {
      box.className = "build-result empty";
      box.textContent = `"${buildSubject.en} has ... ${buildPart.en}." — 꾸며 주는 말(크기·색깔 등)을 골라 문장을 완성해요! 👆`;
      lastBuilt = "";
      return;
    }
    const why = checkHasCombo(buildPart, buildAdjs);
    if (why) {
      box.className = "build-result bad";
      box.innerHTML = "";
      const badge = document.createElement("div");
      badge.className = "br-badge";
      badge.textContent = "🤔 이 조합은 어색해요";
      const note = document.createElement("div");
      note.className = "br-note";
      note.innerHTML = why;
      box.append(badge, note);
      lastBuilt = "";
      return;
    }
    // 형용사 순서: 크기/길이 → 모양 → 색깔
    const adjEn = [buildAdjs.size || buildAdjs.length, buildAdjs.style, buildAdjs.color].filter(Boolean);
    const adjKoArr = [];
    if (buildAdjs.size) adjKoArr.push(adjKo("size", buildAdjs.size));
    if (buildAdjs.length) adjKoArr.push(adjKo("length", buildAdjs.length));
    if (buildAdjs.style) adjKoArr.push(adjKo("style", buildAdjs.style));
    if (buildAdjs.color) adjKoArr.push(adjKo("color", buildAdjs.color));
    const np = (buildPart.article ? buildPart.article + " " : "") + adjEn.join(" ") + " " + buildPart.en;
    const en = `${buildSubject.en} has ${np}.`;
    const ko = `${buildSubject.ko} ${adjKoArr.join(" ")} ${buildPart.koObj} 가지고 있어요.`;
    showGoodResult(box, en, ko);
    return;
  }

  /* --- is wearing ~ --- */
  if (!buildItem) {
    box.className = "build-result empty";
    box.textContent = "무엇을 입고/쓰고 있는지 골라보세요! 👆";
    lastBuilt = "";
    return;
  }
  if (buildItemColor && !buildItem.color) {
    box.className = "build-result bad";
    box.innerHTML = "";
    const badge = document.createElement("div");
    badge.className = "br-badge";
    badge.textContent = "🤔 이 조합은 어색해요";
    const note = document.createElement("div");
    note.className = "br-note";
    note.innerHTML = `"<b>${buildItem.noun}</b>" 에는 보통 색깔을 붙이지 않아요.<br>색깔 없이 말하거나, <b>dress · hat · cap</b> 같은 것을 골라 보세요!`;
    box.append(badge, note);
    lastBuilt = "";
    return;
  }
  const colorEn = buildItemColor ? buildItemColor.en + " " : "";
  const np = (buildItem.plural ? "" : "a ") + colorEn + buildItem.noun;
  const en = `${buildSubject.en}'s wearing ${np}.`;
  const koColor = buildItemColor ? buildItemColor.ko + " " : "";
  const ko = `${buildSubject.ko} ${koColor}${buildItem.koObj} ${buildItem.verb}고 있어요.`;
  showGoodResult(box, en, ko);
}

function showGoodResult(box, en, ko) {
  box.className = "build-result ok";
  box.innerHTML = "";

  const question = buildSubject.boy ? "What does he look like?" : "What does she look like?";

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

  const item = { en, ko, emoji: buildSubject.emoji, face, type: "combo" };
  const starBtn = document.createElement("button");
  starBtn.className = "btn";
  const on = isSelected(en);
  starBtn.textContent = on ? "✓ 연습 목록에 있음" : "⭐ 연습 목록에 추가";
  starBtn.addEventListener("click", () => { toggleSelect(item, "combo"); updateBuildResult(); });

  actions.append(listenBtn, starBtn);
  box.append(badge, preview, qEl, enEl, koEl, actions);

  // 새로운 문장이 완성되면 한 번만 "질문 → 대답"으로 들려주기
  if (en !== lastBuilt) { lastBuilt = en; speakQA(question, en, null); }
}

function randOf(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

document.getElementById("build-random").addEventListener("click", () => {
  buildSubject = randOf(BUILD_SUBJECTS);
  buildMode = Math.random() < 0.55 ? "has" : "wearing";
  buildAdjs = {}; buildItem = null; buildItemColor = null; buildPart = null;

  if (buildMode === "has") {
    buildPart = randOf(BUILD_PARTS);
    if (buildPart.allow.size && Math.random() < (buildPart.allow.color ? 0.6 : 1)) {
      buildAdjs.size = randOf(BUILD_ADJ_GROUPS[0].items).en;
    }
    if (buildPart.allow.length) buildAdjs.length = randOf(BUILD_ADJ_GROUPS[1].items).en;
    if (buildPart.allow.style && Math.random() < 0.6) buildAdjs.style = randOf(BUILD_ADJ_GROUPS[2].items).en;
    if (buildPart.allow.color) {
      const pool = buildPart.allow.color === "eye" ? EYE_COLOR_OK : HAIR_COLOR_OK;
      buildAdjs.color = randOf(pool);
    }
  } else {
    buildItem = randOf(BUILD_ITEMS);
    if (buildItem.color && Math.random() < 0.8) buildItemColor = randOf(ITEM_COLORS);
  }
  renderBuilder();
  updateBuildResult();
});

document.getElementById("build-clear").addEventListener("click", () => {
  buildPart = null; buildAdjs = {}; buildItem = null; buildItemColor = null;
  synth.cancel();
  renderBuilder();
  updateBuildResult();
});

/* ===========================================================
 * 🕵️ 누구게? 듣고 찾기 퀴즈
 * =========================================================== */
let quiz = null;              // { chars, answer, sentences, enText, koText, done, tries }
let quizScore = { right: 0, total: 0 };

function randomQuizChar(boy) {
  return {
    boy,
    hairLen: randOf(["long", "short"]),
    hairStyle: randOf(["straight", "curly"]),
    hairColor: randOf(QUIZ_HAIR_COLORS),
    eyeColor: randOf(QUIZ_EYE_COLORS),
  };
}

/* 문제에서 '말해 주는' 특징만 뽑은 서명 (보기끼리 겹치지 않게) */
function quizSignature(c, spec) {
  const parts = [c.hairLen, c.hairColor];
  if (spec.sayStyle) parts.push(c.hairStyle);
  parts.push(spec.second === "eyes" ? c.eyeColor : (c.wear ? c.wear.key : "none"));
  return parts.join("|");
}

function newQuiz() {
  const boy = Math.random() < 0.5;
  const spec = {
    sayStyle: Math.random() < 0.5,
    second: Math.random() < 0.5 ? "eyes" : "wear",
  };

  // 정답 캐릭터
  const answer = randomQuizChar(boy);
  if (spec.second === "wear") {
    const pool = QUIZ_WEARS.filter(w => boy ? !w.girlOnly : true);
    answer.wear = randOf(pool);
  }

  // 오답 3명: 설명에 나오는 특징 중 1~2개를 다르게
  const used = new Set([quizSignature(answer, spec)]);
  const chars = [answer];
  let guard = 0;
  while (chars.length < 4 && guard++ < 60) {
    const c = randomQuizChar(boy);
    if (spec.second === "wear") {
      const pool = QUIZ_WEARS.filter(w => boy ? !w.girlOnly : true);
      if (Math.random() < 0.75) c.wear = randOf(pool);
    }
    const sig = quizSignature(c, spec);
    if (used.has(sig)) continue;
    used.add(sig);
    chars.push(c);
  }
  // 순서 섞기
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  // 설명 문장 만들기
  const subj = boy ? "He" : "She";
  const subjKo = boy ? "그는" : "그녀는";
  const s1 = `${subj} has ${answer.hairLen}${spec.sayStyle ? " " + answer.hairStyle : ""} ${answer.hairColor} hair.`;
  const k1 = `${subjKo} ${answer.hairLen === "long" ? "긴" : "짧은"}${spec.sayStyle ? (answer.hairStyle === "curly" ? " 곱슬곱슬한" : " 곧은") : ""} ${QUIZ_HAIR_COLOR_KO[answer.hairColor]} 머리를 가지고 있어요.`;
  let s2, k2;
  if (spec.second === "eyes") {
    s2 = `${subj} has ${answer.eyeColor} eyes.`;
    k2 = `${subjKo} ${QUIZ_EYE_COLOR_KO[answer.eyeColor]} 눈을 가지고 있어요.`;
  } else {
    s2 = `${subj}'s wearing ${answer.wear.en}.`;
    k2 = `${subjKo} ${answer.wear.ko} 있어요.`;
  }

  quiz = {
    chars, answer, spec,
    enText: s1 + " " + s2,
    koText: k1 + " " + k2,
    done: false, firstTry: true,
  };
  renderQuiz();
  document.getElementById("quiz-feedback").className = "quiz-feedback";
  document.getElementById("quiz-feedback").textContent = "👂 설명을 잘 듣고 알맞은 친구를 클릭하세요!";
  document.getElementById("quiz-sentence").classList.add("hidden");
  speak(quiz.enText);
}

function quizCharFace(c) {
  const f = {
    boy: c.boy,
    hairLen: c.hairLen, hairStyle: c.hairStyle, hairColor: c.hairColor,
    eyeColor: c.eyeColor, eyeSize: "big",   // 눈 색이 잘 보이도록 크게
  };
  if (c.wear) Object.assign(f, c.wear.apply);
  return f;
}

function renderQuiz() {
  const grid = document.getElementById("quiz-grid");
  grid.innerHTML = "";
  quiz.chars.forEach((c, i) => {
    const card = document.createElement("button");
    card.className = "qcard";
    card.innerHTML = faceSVG(quizCharFace(c), FACE_BGS[i % FACE_BGS.length]);
    const label = document.createElement("div");
    label.className = "qcard-num";
    label.textContent = ["①", "②", "③", "④"][i];
    card.appendChild(label);
    card.addEventListener("click", () => onQuizPick(card, c));
    grid.appendChild(card);
  });
  updateQuizScore();
}

function onQuizPick(card, c) {
  if (!quiz || quiz.done) return;
  const fb = document.getElementById("quiz-feedback");
  if (c === quiz.answer) {
    quiz.done = true;
    quizScore.total++;
    if (quiz.firstTry) quizScore.right++;
    card.classList.add("correct");
    document.querySelectorAll(".qcard").forEach(q => { if (q !== card) q.classList.add("dim"); });
    fb.className = "quiz-feedback good";
    fb.textContent = quiz.firstTry ? "🎉 정답이에요! 한 번에 찾았어요!" : "🎉 정답이에요!";
    showQuizSentence();
    speak("Great job!");
    updateQuizScore();
  } else {
    quiz.firstTry = false;
    card.classList.add("wrong");
    setTimeout(() => card.classList.remove("wrong"), 600);
    fb.className = "quiz-feedback bad";
    fb.textContent = "🙈 아니에요! 다시 한번 잘 들어보세요.";
    speak(quiz.enText);
  }
}

function showQuizSentence() {
  const boxEl = document.getElementById("quiz-sentence");
  boxEl.classList.remove("hidden");
  boxEl.innerHTML = "";
  const en = document.createElement("div");
  en.className = "en";
  en.appendChild(buildWords(quiz.enText));
  const ko = document.createElement("div");
  ko.className = "ko";
  ko.textContent = quiz.koText;
  boxEl.append(en, ko);
}

function updateQuizScore() {
  document.getElementById("quiz-score").textContent =
    `한 번에 맞힘 ${quizScore.right} / ${quizScore.total}문제`;
}

document.getElementById("quiz-new").addEventListener("click", newQuiz);
document.getElementById("quiz-replay").addEventListener("click", () => {
  if (quiz) speak(quiz.enText);
});
document.getElementById("quiz-show").addEventListener("click", () => {
  if (quiz) showQuizSentence();
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

/* ---------- 초기 렌더 ---------- */
renderSuggestions();
renderGrid("color-grid", COLOR_WORDS, { tones: true, noIndex: true });
renderGrid("size-grid", SIZE_WORDS, { tones: true, noIndex: true });
renderGrid("body-grid", BODY_WORDS, { tones: true, noIndex: true });
renderGrid("wear-grid", WEAR_WORDS, { tones: true, noIndex: true });
renderBuilder();
updateBuildResult();
updatePracticeBadge();
updateQuizScore();

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
    if (btn.dataset.tab === "quiz" && !quiz) newQuiz();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

/* ---------- 속도 조절 ---------- */
document.getElementById("rate").addEventListener("input", e => {
  speakRate = parseFloat(e.target.value);
});
