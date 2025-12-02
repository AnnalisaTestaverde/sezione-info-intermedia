let currentSlide = 0;
let isTyping = false;
let typingPhase = "main";
let typedMain = 0;
let typedCaption = 0;
let typingSpeed = 1.5;
let frameCounter = 0;

// Bounds per frecce
let vBounds = { x: 0, y: 0, w: 0, h: 0 };      // freccia giù
let upBounds = { x: 0, y: 0, w: 0, h: 0 };    // freccia su

let slides = [
  {
    lines: ["Volcanic eruptions in our dataset are", "described through an impact score."]
  },
  {
    lines: ["Each eruption’s impact is based on four",
    "factors: deaths, injuries, destroyed",
    "houses, and economic damage."]
  },
  {
    lines: [
      "DEATHS:",
      "1 = ~1–50 deaths",
      "2 = ~51–100 deaths",
      "3 = ~101–1,000 deaths",
      "4 = 1,001+ deaths"
    ],
    caption: "Each numerical level corresponds to a range of estimated fatalities."
  },
  {
    lines: [
      "INJURIES:",
      "1 = ~1–50 injuries",
      "2 = ~51–100 injuries",
      "3 = ~101–1,000 injuries",
      "4 = 1,001+ injuries"
    ],
    caption: "Each numerical level corresponds to a range of estimated injuries."
  },
  {
    lines: [
      "DESTROYED HOUSES:",
      "1 = ~1–50 houses",
      "2 = ~51–100 houses",
      "3 = ~101–1,000 houses",
      "4 = 1,001+ houses"
    ],
    caption: "Each numerical level corresponds to a range of estimated destroyed houses."
  },
  {
    lines: [
      "ECONOMIC DAMAGE:",
      "1 = less than ~$1 million",
      "2 = ~$1–5 million",
      "3 = ~$5–24 million",
      "4 = $25 million or more"
    ],
    caption: "Each numerical level corresponds to a range of estimated economic losses."
  },
  {
    lines: [
      "Each eruption is assigned a total impact",
      "score, calculated by adding together the",
      "four factor levels (deaths, injuries,",
      "destroyed houses, and economic damage)."
    ]
  },
  {
    lines: [
      "The score ranges from 1 to 16, with higher",
      "values representing eruptions with greater",
      "overall severity."
    ]
  }
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  startTyping();
  window.addEventListener('wheel', handleScroll, { passive: false });
}

function draw() {
  background(255, 43, 0); // #FF2B00

  let current = slides[currentSlide];
  let fullMain = current.lines.join('\n');
  let fullCaption = current.caption || "";

  if (isTyping) {
    if (frameCounter % typingSpeed === 0) {
      if (typingPhase === "main") {
        typedMain++;
        if (typedMain >= fullMain.length) {
          if (fullCaption) {
            typingPhase = "caption";
            typedCaption = 0;
          } else {
            isTyping = false;
          }
        }
      } else if (typingPhase === "caption") {
        typedCaption++;
        if (typedCaption >= fullCaption.length) {
          isTyping = false;
        }
      }
    }
    frameCounter++;
  }

  let displayMain = fullMain.substring(0, typedMain);
  let displayCaption = fullCaption.substring(0, typedCaption);
  drawMultilineText(displayMain, displayCaption, width / 2);

  // ✅ Freccia SU (solo se non siamo alla prima slide)
  if (!isTyping && currentSlide > 0) {
    drawBouncingUpArrow();
  }

  // ✅ Freccia GIÙ (sempre visibile)
  if (!isTyping) {
    drawBouncingV();
  }
}

function drawMultilineText(displayMain, displayCaption, xCenter) {
  let current = slides[currentSlide];
  let displayedMainLines = displayMain.split('\n');
  let fullLines = current.lines;

  let mainSize = 36;
  let captionSize = 22;
  let mainLineHeight = 44;
  let captionLineHeight = 28;
  let captionSpacing = 24;

  textSize(mainSize);
  textStyle(BOLD);
  let maxWidthMain = 0;
  for (let line of fullLines) {
    let w = textWidth(line);
    if (w > maxWidthMain) maxWidthMain = w;
  }

  let maxWidthCaption = 0;
  if (current.caption) {
    textSize(captionSize);
    textStyle(BOLD);
    maxWidthCaption = textWidth(current.caption);
  }

  let blockWidth = Math.max(maxWidthMain, maxWidthCaption);
  let xStart = xCenter - blockWidth / 2;

  let totalMainHeight = fullLines.length * mainLineHeight;
  let hasCaption = !!current.caption;
  let totalHeight = totalMainHeight + (hasCaption ? captionSpacing + captionLineHeight : 0);
  let startY = height / 2 - totalHeight / 2;

  textAlign(LEFT, TOP);
  textSize(mainSize);
  textStyle(BOLD);
  fill(0);
  for (let i = 0; i < fullLines.length; i++) {
    let lineToShow = i < displayedMainLines.length ? displayedMainLines[i] : "";
    text(lineToShow, xStart, startY + i * mainLineHeight);
  }

  if (hasCaption) {
    let captionY = startY + totalMainHeight + captionSpacing;
    textSize(captionSize);
    textStyle(BOLD);
    fill(255);
    text(displayCaption, xStart, captionY);
  }
}

// ✅ Freccia GIÙ (V)
function drawBouncingV() {
  let x = width / 2;
  let baseY = height - 120;
  let bounce = sin(frameCount * 0.12) * 8;
  let y = baseY + bounce;

  textStyle(BOLD);
  textSize(40);
  fill(0);
  text("V", x, y);

  vBounds.w = 40;
  vBounds.h = 40;
  vBounds.x = x - vBounds.w / 2;
  vBounds.y = y - vBounds.h / 2;
}

// ✅ Freccia SU (Λ)
function drawBouncingUpArrow() {
  let x = width / 2;
  let baseY = 120; // 120px dal top
  let bounce = sin(frameCount * 0.12 + PI) * 8; // opposta alla V
  let y = baseY + bounce;

  textStyle(BOLD);
  textSize(40);
  fill(0);
  text("Λ", x, y);

  upBounds.w = 40;
  upBounds.h = 40;
  upBounds.x = x - upBounds.w / 2;
  upBounds.y = y - upBounds.h / 2;
}

function mousePressed() {
  if (isTyping) {
    let current = slides[currentSlide];
    typedMain = current.lines.join('\n').length;
    typedCaption = (current.caption || "").length;
    isTyping = false;
    frameCounter = 0;
  } else {
    // Clic sulla freccia SU
    if (
      currentSlide > 0 &&
      mouseX >= upBounds.x &&
      mouseX <= upBounds.x + upBounds.w &&
      mouseY >= upBounds.y &&
      mouseY <= upBounds.y + upBounds.h
    ) {
      currentSlide--;
      startTyping();
    }
    // Clic sulla freccia GIÙ
    else if (
      mouseX >= vBounds.x &&
      mouseX <= vBounds.x + vBounds.w &&
      mouseY >= vBounds.y &&
      mouseY <= vBounds.y + vBounds.h
    ) {
      if (currentSlide < slides.length - 1) {
        currentSlide++;
        startTyping();
      }
    }
  }
}

// ✅ SCROLL BIDIREZIONALE
function handleScroll(event) {
  if (isTyping) return;

  let delta = event.deltaY;
  event.preventDefault();

  if (delta > 0 && currentSlide < slides.length - 1) {
    currentSlide++;
    startTyping();
  } else if (delta < 0 && currentSlide > 0) {
    currentSlide--;
    startTyping();
  }
}

function startTyping() {
  isTyping = true;
  typingPhase = "main";
  typedMain = 0;
  typedCaption = 0;
  frameCounter = 0;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}