// It just listens to the keyboard and writes to an object.
// Zero dependancies, no classes, no fancy stuff. Just a simple object, which can read from in my game loop.

const input = {
  left: false,
  right: false,
  pause: false,
  enter: false,
};

let pauseConsumed = false;
let enterConsumed = false;

// export the input object and the consumeInput function so other modules can use them
window.addEventListener("keydown", (e) => {
  switch (e.code) {
    case "ArrowLeft":
    case "KeyA":
      input.left = true; // set left to true when the left arrow or 'A' key is pressed. It sets it to true again and again depending the time you hold the key down, but that's fine because the game loop will read it and act on it every frame. That's intentional by me.
      break;

    case "ArrowRight":
    case "KeyD":
      input.right = true;
      break;

    case "KeyP":
    case "Escape":
      if (!e.repeat) input.pause = true; // only set pause to true on the first keydown event, not on repeats
      break;

    case "Enter":
      if (!e.repeat) input.enter = true;
      break;
  }

  // Block the default behaviour of the arrow keys so the page doesn't scroll when the player is using them to control the game.
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.code)) {
    e.preventDefault();
  }
});

// Sets the left and right keys to false when the player releases them
window.addEventListener("keyup", (e) => {
  switch (e.code) {
    case "ArrowLeft":
    case "KeyA":
      input.left = false;
      break;

    case "ArrowRight":
    case "KeyD":
      input.right = false;
      break;
  }
});

// Calls the following function at the end of each frame for the one-shot keys.
// game.js calls this after it's read input.pause and input.enter
// So they're only true for exactly one frame regardless of how long the player holds the key.
// This is important for pause and enter because you don't want the game to pause and unpause immediately if the player holds the key down for a long time.
function consumeInput() {
  input.pause = false;
  input.enter = false;
}