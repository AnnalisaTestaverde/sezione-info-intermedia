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

// Array di slide con le parole da evidenziare in BIANCO
let slides = [
  {
    lines: ["Volcanic eruptions in our dataset are", "described through an impact score."],
    highlightedWords: ["impact score"]
  },
  {
    lines: ["Each eruption's impact is based on four", "factors: deaths, injuries, destroyed", "houses, and economic damage."],
    highlightedWords: ["deaths", "injuries", "destroyed houses", "economic damage"]
  },
  {
    lines: [
      "Each eruption is assigned a total impact",
      "score, calculated by adding together the",
      "four factor levels (deaths, injuries,",
      "destroyed houses, and economic damage).",
      "The score ranges from 1 to 16, with higher",
      "values representing eruptions with greater",
      "overall severity."
    ],
    highlightedWords: ["total impact score", "four factor levels", "score ranges", "1 to 16"]
  }
];

// Stato hover per il bottone
let isHovering = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  startTyping();
  window.addEventListener('wheel', handleScroll, { passive: false });
}

function draw() {
  background(255, 43, 0); // #FF2B00 - Sfondo rosso

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

  // Freccia SU (solo se non siamo alla prima slide)
  if (!isTyping && currentSlide > 0) {
    drawBouncingUpArrow();
  }

  // Freccia GIÙ (sempre visibile, tranne nell'ultima slide)
  if (!isTyping && currentSlide < slides.length - 1) {
    drawBouncingV();
  }

  // Bottone "Go to the map" nell'ultima slide
  if (currentSlide === slides.length - 1 && !isTyping) {
    drawGoToMapButton();
  }
}

function drawMultilineText(displayMain, displayCaption, xCenter) {
  let current = slides[currentSlide];
  let displayedMainLines = displayMain.split('\n');
  let fullLines = current.lines;
  let highlightedWords = current.highlightedWords || [];

  let mainSize = 36;
  let captionSize = 22;
  let mainLineHeight = 44;
  let captionLineHeight = 28;
  let captionSpacing = 24;

  textSize(mainSize);
  textStyle(BOLD);
  
  // Trova la larghezza massima del testo
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
  
  // Disegna ogni linea di testo
  for (let i = 0; i < fullLines.length; i++) {
    let lineToShow = i < displayedMainLines.length ? displayedMainLines[i] : "";
    let lineText = fullLines[i];
    let lineY = startY + i * mainLineHeight;
    let currentX = xStart;
    
    // Controlla quali parole sono già state digitate in questa linea
    let typedInThisLine = displayedMainLines[i] || "";
    
    // Processa il testo carattere per carattere
    for (let charIndex = 0; charIndex < lineText.length; charIndex++) {
      let char = lineText[charIndex];
      let typedChar = charIndex < typedInThisLine.length ? typedInThisLine[charIndex] : "";
      
      if (typedChar === "") break; // Non disegnare caratteri non ancora digitati
      
      // Controlla se questo carattere è parte di una parola evidenziata
      let shouldHighlight = false;
      
      // Gestione speciale per "destroyed houses" nella seconda slide
      if (currentSlide === 1 && (i === 1 || i === 2)) {
        // Seconda slide, linee 2 e 3 (indici 1 e 2)
        if (i === 1 && lineText.includes("destroyed")) {
          // Se siamo nella linea con "destroyed"
          let destroyedPos = lineText.indexOf("destroyed");
          if (charIndex >= destroyedPos && charIndex < destroyedPos + "destroyed".length) {
            if (typedInThisLine.length > destroyedPos) {
              shouldHighlight = true;
            }
          }
        } else if (i === 2 && lineText.includes("houses")) {
          // Se siamo nella linea con "houses"
          let housesPos = lineText.indexOf("houses");
          if (charIndex >= housesPos && charIndex < housesPos + "houses".length) {
            if (typedInThisLine.length > housesPos) {
              shouldHighlight = true;
            }
          }
        }
      }
      
      // Controlla altre parole evidenziate se non abbiamo ancora trovato una corrispondenza
      if (!shouldHighlight) {
        // Cerca tutte le parole evidenziate per vedere se questo carattere ne fa parte
        for (let hw of highlightedWords) {
          // Salta "destroyed houses" che abbiamo già gestito
          if (hw === "destroyed houses" && currentSlide === 1) continue;
          
          let hwLower = hw.toLowerCase();
          let lineLower = lineText.toLowerCase();
          
          // Trova tutte le occorrenze di questa parola nella linea
          let startIndex = 0;
          while (true) {
            let pos = lineLower.indexOf(hwLower, startIndex);
            if (pos === -1) break;
            
            // Se il carattere corrente è dentro questa occorrenza
            if (charIndex >= pos && charIndex < pos + hw.length) {
              // Controlla se abbiamo digitato abbastanza caratteri
              if (typedInThisLine.length > pos) {
                shouldHighlight = true;
                break;
              }
            }
            startIndex = pos + 1;
          }
          if (shouldHighlight) break;
        }
      }
      
      if (shouldHighlight) {
        fill(255); // Testo BIANCO per le parole evidenziate
      } else {
        fill(0); // Testo NERO per il resto
      }
      
      // Disegna il carattere
      text(typedChar, currentX, lineY);
      currentX += textWidth(typedChar);
    }
  }

  if (hasCaption) {
    let captionY = startY + totalMainHeight + captionSpacing;
    textSize(captionSize);
    textStyle(BOLD);
    fill(0); // Caption nero
    text(displayCaption, xStart, captionY);
  }
}

// Freccia GIÙ (V) - NERA
function drawBouncingV() {
  let x = width / 2;
  let baseY = height - 120;
  let bounce = sin(frameCount * 0.12) * 8;
  let y = baseY + bounce;

  textStyle(BOLD);
  textSize(40);
  fill(0); // Freccia NERA
  text("V", x, y);

  vBounds.w = 40;
  vBounds.h = 40;
  vBounds.x = x - vBounds.w / 2;
  vBounds.y = y - vBounds.h / 2;
}

// Freccia SU (Λ) - NERA
function drawBouncingUpArrow() {
  let x = width / 2;
  let baseY = 120;
  let bounce = sin(frameCount * 0.12 + PI) * 8;
  let y = baseY + bounce;

  textStyle(BOLD);
  textSize(40);
  fill(0); // Freccia NERA
  text("Λ", x, y);

  upBounds.w = 40;
  upBounds.h = 40;
  upBounds.x = x - upBounds.w / 2;
  upBounds.y = y - upBounds.h / 2;
}

// Bottone "Go to the map" - NERO con testo BIANCO e ombra diffusa
function drawGoToMapButton() {
  let buttonW = 200;
  let buttonH = 50;
  let buttonX = width / 2 - buttonW / 2;
  let buttonY = height - 100;

  // Calcola scala hover
  let scale = isHovering ? 1.05 : 1.0;
  let scaledW = buttonW * scale;
  let scaledH = buttonH * scale;
  let scaledX = buttonX - (scaledW - buttonW) / 2;
  let scaledY = buttonY - (scaledH - buttonH) / 2;

  // OMBRA DIFFUSA - Disegna più strati per un effetto blur
  noStroke();
  
  // Strato 1: più diffuso e trasparente
  for (let i = 0; i < 5; i++) {
    let blurRadius = i * 2;
    let alpha = 20 - i * 3;
    fill(0, 0, 0, alpha);
    rect(
      scaledX + 4, 
      scaledY + 4 + blurRadius/2, 
      scaledW, 
      scaledH, 
      25
    );
  }
  
  // Strato 2: ombra principale più morbida
  for (let i = 0; i < 3; i++) {
    let offset = i * 1.5;
    let alpha = 30 - i * 8;
    fill(0, 0, 0, alpha);
    rect(
      scaledX + offset, 
      scaledY + offset, 
      scaledW, 
      scaledH, 
      25
    );
  }

  // Sfondo bottone — NERO
  fill(0);
  noStroke();
  rect(scaledX, scaledY, scaledW, scaledH, 25);

  // Testo bottone — BIANCO
  fill(255);
  textSize(20);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text("Go to the map", scaledX + scaledW / 2, scaledY + scaledH / 2);

  // Aggiorna bounds per il click
  vBounds.x = buttonX;
  vBounds.y = buttonY;
  vBounds.w = buttonW;
  vBounds.h = buttonH;
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
    // Clic sulla freccia GIÙ o sul bottone "Go to the map"
    else if (
      mouseX >= vBounds.x &&
      mouseX <= vBounds.x + vBounds.w &&
      mouseY >= vBounds.y &&
      mouseY <= vBounds.y + vBounds.h
    ) {
      if (currentSlide < slides.length - 1) {
        currentSlide++;
        startTyping();
      } else if (currentSlide === slides.length - 1) {
        // VAI ALLA MAPPA
        window.location.href = "map.html";
      }
    }
  }
}

// SCROLL BIDIREZIONALE
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

// Rileva hover sul bottone
function mouseMoved() {
  if (currentSlide === slides.length - 1 && !isTyping) {
    if (
      mouseX >= vBounds.x &&
      mouseX <= vBounds.x + vBounds.w &&
      mouseY >= vBounds.y &&
      mouseY <= vBounds.y + vBounds.h
    ) {
      isHovering = true;
      cursor(HAND);
    } else {
      isHovering = false;
      cursor(ARROW);
    }
  } else {
    cursor(ARROW);
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