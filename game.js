const STATE = {
  IDLE: "idle", // Waiting for the player to press enter to start
  PLAYING: "playing",
  PAUSED: "paused",
  GAMEOVER: "gameover",
  WIN: "win",
};

let state = STATE.IDLE; // Current game state — used to gate input and control flow
let paused = false;
let score = 0;
let lives = 3;
let seconds = 0;
let timerAcc = 0; // Accumulates delta-time until a full second has passed

const ROWS = 6;
const COLS = 10;
const BRICK_W = 42;
const BRICK_H = 16;
const BRICK_GAP = 4;
const BRICK_OFFSET_X = 9; // Left margin so the grid sits centred in the 480-unit field
const BRICK_OFFSET_Y = 60; // Top margin — pushes the grid down from the ceiling

// One colour per row — top rows worth more points
const ROW_COLOURS = [
  "#cc3333",
  "#cc6633",
  "#ccaa33",
  "#33cc66",
  "#3399cc",
  "#7755cc",
];
const ROW_POINTS = [6, 5, 4, 3, 2, 1];

let bricks = [];

function buildBrickData() {
  bricks = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      bricks.push({
        x: BRICK_OFFSET_X + c * (BRICK_W + BRICK_GAP),
        y: BRICK_OFFSET_Y + r * (BRICK_H + BRICK_GAP),
        w: BRICK_W,
        h: BRICK_H,
        colour: ROW_COLOURS[r],
        points: ROW_POINTS[r],
        alive: true,
        el: null, // render.js attaches the DOM node here
      });
    }
  }
}

function allBricksCleared() {
  return bricks.every((b) => !b.alive);
}

function startGame() {
  score = 0;
  lives = 3;
  seconds = 0;
  timerAcc = 0;
  paused = false;

  buildBrickData();
  buildBricks(bricks); // render.js — creates SVG rects and attaches el refs
  resetPhysics(); // physics.js — centres ball and paddle, sets launch velocity

  renderScore(score);
  renderLives(lives);
  renderTimer(seconds);
  hideOverlay();

  state = STATE.PLAYING;
}

function restartGame() {
  startGame();
}

function loseLife() {
  lives -= 1;
  renderLives(lives);

  if (lives <= 0) {
    renderFinalScore(score);
    showScreen("gameover");
    state = STATE.GAMEOVER;
    return;
  }

  // still lives left — relaunch ball from centre
  resetPhysics();
}

function winGame() {
  renderFinalScore(score);
  showScreen("win");
  state = STATE.WIN;
}

let lastTime = 0;

function loop(timestamp) {
  const delta = timestamp - lastTime;
  lastTime = timestamp;

  if (state === STATE.PLAYING && !paused) {
    update(delta);
  }

  requestAnimationFrame(loop); // keeps the loop going forever, even when paused. the paused flag just skips the update step, the loop keeps ticking.
}

function update(delta) {
  if (input.pause) {
    paused = true;
    showScreen("pause");
    consumeInput();
    return;
  }

  updatePaddle(input, delta);
  renderPaddle(paddle.x);

  const result = updateBall(bricks, delta);
  renderBall(ball.x, ball.y);

  if (result.hit) {
    const brick = bricks[result.brickIndex];
    score += brick.points;
    renderScore(score);
    destroyBrick(brick);

    if (allBricksCleared()) {
      winGame();
      return;
    }
  }

  if (isDeadZone()) {
    loseLife();
    return;
  }

  // timer — increments every full second
  timerAcc += delta;
  if (timerAcc >= 1000) {
    timerAcc -= 1000;
    seconds += 1;
    renderTimer(seconds);
  }

  consumeInput();
}

document.getElementById("btn-continue").addEventListener("click", () => {
  if (state !== STATE.PLAYING) return;
  paused = false;
  hideOverlay();
});

document.getElementById("btn-restart-pause").addEventListener("click", () => {
  restartGame();
});

document.getElementById("btn-restart-over").addEventListener("click", () => {
  restartGame();
});

document.getElementById("btn-restart-win").addEventListener("click", () => {
  restartGame();
});

window.addEventListener("keydown", (e) => {
  if (e.code !== "Enter") return;

  if (state === STATE.IDLE) {
    startGame();
    return;
  }
  if (state === STATE.GAMEOVER) {
    restartGame();
    return;
  }
  if (state === STATE.WIN) {
    restartGame();
    return;
  }
});

showScreen("start");
requestAnimationFrame(loop); // starts the loop immediately — rAF never stops