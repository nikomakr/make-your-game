// All DOM touches live here, nowhere else
// Reads positions from physics.js and updates the screen

const svgEl = document.getElementById("game");
const ballEl = document.getElementById("ball");
const paddleEl = document.getElementById("paddle");
const bricksLayer = document.getElementById("layer-bricks");
const overlay = document.getElementById("layer-overlay");

const screens = {
  start: document.getElementById("screen-start"),
  pause: document.getElementById("screen-pause"),
  gameover: document.getElementById("screen-gameover"),
  win: document.getElementById("screen-win"),
};

const hud = {
  score: document.getElementById("score"),
  timer: document.getElementById("timer"),
  lives: document.getElementById("lives"),
};

function renderBall(x, y) {
  ballEl.style.transform = `translate3d(${x - 240}px, ${y - 400}px, 0)`; // offset from initial cx/cy in HTML
}

function renderPaddle(x) {
  paddleEl.style.transform = `translate3d(${x - 190}px, 0px, 0)`; // offset from initial x in HTML
}

function buildBricks(bricks) {
  bricksLayer.innerHTML = ""; // wipe old bricks on restart

  bricks.forEach((b, i) => {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", b.x);
    rect.setAttribute("y", b.y);
    rect.setAttribute("width", b.w);
    rect.setAttribute("height", b.h);
    rect.setAttribute("rx", "3");
    rect.setAttribute("fill", b.colour);
    rect.setAttribute("stroke", "rgba(0,0,0,0.3)");
    rect.setAttribute("stroke-width", "1");
    rect.id = `brick-${i}`;
    bricksLayer.appendChild(rect);
    b.el = rect; // direct reference — no DOM querying mid-game
  });
}

function destroyBrick(brick) {
  brick.el.setAttribute("visibility", "hidden"); // keeps the node in the tree, just invisible
}

function showScreen(name) {
  Object.entries(screens).forEach(([key, el]) => {
    el.setAttribute("visibility", key === name ? "visible" : "hidden");
  });
  overlay.setAttribute("visibility", "visible");
}

function hideOverlay() {
  overlay.setAttribute("visibility", "hidden");
  // hide all child screens too — SVG visibility doesn't cascade like HTML
  Object.values(screens).forEach((el) =>
    el.setAttribute("visibility", "hidden"),
  );
}

function renderScore(score) {
  hud.score.textContent = score;
}

function renderLives(lives) {
  hud.lives.textContent = "♥ ".repeat(lives).trim();
}

function renderTimer(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  hud.timer.textContent = `${m}:${s}`;
}

function renderFinalScore(score) {
  document.getElementById("final-score-label").textContent = `Score: ${score}`;
  document.getElementById("win-score-label").textContent = `Score: ${score}`;
}