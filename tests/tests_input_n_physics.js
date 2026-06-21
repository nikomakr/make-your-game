// ── physics ──────────────────────────────────────────────────────

resetPhysics();
console.log("ball after reset:", ball);
// vx and vy should be non-zero, ball centred, paddle centred

// wall collision — shove ball into left wall and check it bounces
ball.x = 3;
ball.vx = -2;
wallCollision();
console.assert(ball.vx > 0, "left wall: vx should be positive");
console.assert(ball.x === BALL_RADIUS, "left wall: ball snapped to edge");

// right wall
ball.x = FIELD_W - 3;
ball.vx = 2;
wallCollision();
console.assert(ball.vx < 0, "right wall: vx should be negative");

// top wall
ball.y = 3;
ball.vy = -2;
wallCollision();
console.assert(ball.vy > 0, "top wall: vy should be positive");

// dead zone
ball.y = FIELD_H + 20;
console.assert(isDeadZone() === true, "dead zone: should return true");
ball.y = 300;
console.assert(isDeadZone() === false, "dead zone: should return false");

// ── input ────────────────────────────────────────────────────────

console.assert(input.left === false, "input: left should start false");
console.assert(input.right === false, "input: right should start false");
console.assert(input.pause === false, "input: pause should start false");
console.assert(input.enter === false, "input: enter should start false");

console.log("all tests passed");