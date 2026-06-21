// physics.js — movement and collision
// There areno DOM touches in this file, it only works with numbers.
// It takes the current state, figures out where everything should be next frame, and returns it. render.js handles the visual side.

// the SVG coordinate space we set in viewBox="0 0 480 640"
// This is the grid we used in HTML to position the bricks, and it's the coordinate space we use for all physics calculations. The paddle and ball can't leave this area.
const FIELD_W = 480; // fixed width of the game field in pixels. the paddle and ball can't leave this area.
const FIELD_H = 640; // fixed height of the game field in pixels. the paddle and ball can't leave this area.

const BALL_RADIUS = 7; // the ball is a circle, but we treat it as a square for collision detection. this is faster and simpler than doing proper circle math, and it's close enough for a small ball.
const PADDLE_W = 100; // the paddle is a rectangle, this is its width in pixels. the player can move it left and right to bounce the ball back up.
const PADDLE_H = 10; // the paddle is a rectangle, this is its height in pixels. the player can move it left and right to bounce the ball back up.
const PADDLE_Y = 610; // fixed vertical position of the paddle in pixels. the paddle only moves horizontally, so this never changes.
const PADDLE_SPEED = 0.4; // pixels per ms rather than pixels per frame so movement stays consistent regardless of frame rating. This number only makes sense in the context of delta-time!

// At 60fps a frame is ~16ms, so 0.25 * 16 = 4px per frame — feels right based on maths further down.
const BALL_SPEED_INITIAL = 0.25; // starting speed of the ball in pixels per ms

// How much we nudge the ball speeds up each time a brick is hit.
// I think small enough to feel gradual, big enough to notice after a few rows.
const BALL_SPEED_INCREMENT = 0.004; // starts at 0.25, after 10 bricks it's 0.29, after 50 bricks it's 0.45, after 100 bricks it's 0.65, after 200 bricks it's 1.05 — fast enough to be a challenge but not so fast that the player can't react.

// The angle range the ball can leave the paddle at, in radians.
// We map where the ball hits the paddle (left edge to right edge) to an angle between these two values so the player has real control over direction not just a flat vertical bounce every time.
const ANGLE_MIN = Math.PI / 6; // 30° — shallow angle near the edges
const ANGLE_MAX = (Math.PI * 5) / 6; // 150° — shallow angle on the other side


// Everything the physics module needs to track between frames. 
// game.js initialises this via resetPhysics() at start and restart.
// This is creating the ball as an object that holds all the information the ball needs to exist in the game.
const ball = {
  x: 240, // centre x
  y: 400, // centre y
  vx: 0, // velocity x — pixels per millisecond
  vy: 0, // velocity y
};
// The above are just starting values, resetPhysics() will set them to the correct starting position and velocity when the game starts or restarts.

const paddle = {
  x: 190, // left edge x (centre would be x + PADDLE_W / 2)
};

// It's called by the actual game in js file at the start of every new game or restart.
// Sets the ball and paddle back to their starting positions and launches the ball upward at a slight angle so it doesn't go straight up — that's boring and makes the first few seconds trivial.
function resetPhysics() {
  paddle.x = (FIELD_W - PADDLE_W) / 2; // centre the paddle horizontally

  ball.x = FIELD_W / 2; // centre the ball horizontally
  ball.y = PADDLE_Y - BALL_RADIUS - 2; // place the ball just above the paddle so it doesn't start inside it

  // launch angle: straight up is 90° (PI/2). we offset slightly
  // so the ball drifts left or right from the start.
  const angle = Math.PI / 2 + (Math.random() * 0.6 - 0.3);
  ball.vx = Math.cos(angle) * BALL_SPEED_INITIAL;
  ball.vy = -Math.sin(angle) * BALL_SPEED_INITIAL; // negative = upward in SVG
}

// Called every frame by game.js, passing in the input state and delta.
// Moves the paddle left or right based on what keys are held.
function updatePaddle(input, delta) {
  if (input.left) paddle.x -= PADDLE_SPEED * delta;
  if (input.right) paddle.x += PADDLE_SPEED * delta;

  // Clamp to field boundaries, image & video explanation created 
  paddle.x = Math.max(0, Math.min(FIELD_W - PADDLE_W, paddle.x));
}

// Moves the ball by its velocity scaled by delta-time.
// After moving, checks collisions in order: walls first, then paddle, then bricks. 
// Order matters — we don't want to check bricks if the ball already bounced off a wall this frame.
function updateBall(bricks, delta) {
  ball.x += ball.vx * delta;
  ball.y += ball.vy * delta;

  wallCollision();
  paddleCollision();
  return brickCollision(bricks);
}

// Bounces the ball off the left, right, and top edges. Check image
function wallCollision() {

  if (ball.x - BALL_RADIUS <= 0) {
    ball.x  = BALL_RADIUS
    ball.vx = Math.abs(ball.vx)       // gone past left — force rightward
  }

  if (ball.x + BALL_RADIUS >= FIELD_W) {
    ball.x  = FIELD_W - BALL_RADIUS
    ball.vx = -Math.abs(ball.vx)      // gone past right — force leftward
  }

  if (ball.y - BALL_RADIUS <= 0) {
    ball.y  = BALL_RADIUS
    ball.vy = Math.abs(ball.vy)       // gone past top — force downward
  }
}

// Reflects the ball off the paddle — angle depends on where it lands
function paddleCollision() {
  const paddleTop = PADDLE_Y

  // Ball must be moving down and overlapping the paddle
  if (
    ball.vy > 0 &&
    ball.y + BALL_RADIUS >= paddleTop &&
    ball.y + BALL_RADIUS <= paddleTop + PADDLE_H &&
    ball.x >= paddle.x - BALL_RADIUS &&
    ball.x <= paddle.x + PADDLE_W + BALL_RADIUS
  ) {
    // 0 = left edge, 0.5 = centre, 1 = right edge
    const hitPos     = (ball.x - paddle.x) / PADDLE_W
    const clampedPos = Math.max(0, Math.min(1, hitPos))

    // Map hit position to a launch angle — edges go shallow, centre goes steep
    const angle = ANGLE_MIN + clampedPos * (ANGLE_MAX - ANGLE_MIN)
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
    ball.vx = Math.cos(angle) * speed
    ball.vy = -Math.sin(angle) * speed  // negative = upward in SVG

    ball.y = paddleTop - BALL_RADIUS - 1  // nudge out so it doesn't get stuck
  }
}

// AABB = Axis-Aligned Bounding Box.
// Both the ball (treated as a small square for speed) and each brick are rectangles — so we just compare edges to see if they overlap.
// fast enough to run on every brick every frame without any performance cost.

function brickCollision(bricks) {
  let result = { hit: false, brickIndex: -1 }; // default result if no collision occurs

  for (let i = 0; i < bricks.length; i++) {
    const b = bricks[i]; 

    // Skip bricks that are already destroyed
    if (!b.alive) continue;

    // AABB overlap check — are the ball and this brick touching?
    const overlapX =
      ball.x + BALL_RADIUS > b.x && ball.x - BALL_RADIUS < b.x + b.w; 
    const overlapY =
      ball.y + BALL_RADIUS > b.y && ball.y - BALL_RADIUS < b.y + b.h;

    if (overlapX && overlapY) {
      // Work out which side the ball hit so we know which axis to reflect.
      // We find the smallest overlap on each axis — that's the side it came from.
      const overlapLeft = ball.x + BALL_RADIUS - b.x;
      const overlapRight = b.x + b.w - (ball.x - BALL_RADIUS);
      const overlapTop = ball.y + BALL_RADIUS - b.y;
      const overlapBottom = b.y + b.h - (ball.y - BALL_RADIUS);

      const minX = Math.min(overlapLeft, overlapRight);
      const minY = Math.min(overlapTop, overlapBottom);

      if (minX < minY) {
        // Hit came from the left or right side — flip horizontal velocity
        ball.vx = -ball.vx;
      } else {
        // Hit came from the top or bottom — flip vertical velocity
        ball.vy = -ball.vy;
      }

      // Mark brick as destroyed and nudge ball speed up slightly
      b.alive = false;
      const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      const newSpeed = speed + BALL_SPEED_INCREMENT;
      const ratio = newSpeed / speed;
      ball.vx *= ratio;
      ball.vy *= ratio;

      result = { hit: true, brickIndex: i };
      break; // only destroy one brick per frame
    }
  }

  return result;
}

// Returns true if the ball has fallen below the bottom of the field, meaning the player has lost a life. The game loop will check this after each frame and handle it accordingly.
function isDeadZone() {
  return ball.y - BALL_RADIUS > FIELD_H;
}
