// Keyboard + mouse + touch input. One jump press queues a jump; holding
// down ducks (and hides in a haystack when one is near). Buttons on the
// title and end screens are clicked with the mouse.
export function createInput(canvas, callbacks) {
  const keys = new Set();
  const state = {
    jumpQueued: false,
    duckHeld: false,
    anyKeyPressed: false,
  };

  function queueJump() {
    state.jumpQueued = true;
    state.anyKeyPressed = true;
    if (callbacks.onAction) callbacks.onAction();
  }

  function onKeyDown(event) {
    if (event.repeat) return;
    const code = event.code;
    if (code === 'Space' || code === 'ArrowUp' || code === 'KeyW') {
      event.preventDefault();
      queueJump();
    } else if (code === 'ArrowDown' || code === 'KeyS') {
      state.duckHeld = true;
      state.anyKeyPressed = true;
      if (callbacks.onAction) callbacks.onAction();
    } else if (code === 'KeyP' || code === 'Escape') {
      if (callbacks.onPause) callbacks.onPause();
    } else if (code === 'KeyR') {
      if (callbacks.onRestart) callbacks.onRestart();
    } else if (code === 'KeyM') {
      if (callbacks.onMute) callbacks.onMute();
    } else if (code === 'Enter') {
      state.anyKeyPressed = true;
      if (callbacks.onAction) callbacks.onAction();
    }
    keys.add(code);
  }

  function onKeyUp(event) {
    if (event.code === 'ArrowDown' || event.code === 'KeyS') state.duckHeld = false;
    keys.delete(event.code);
  }

  function onPointerDown(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    if (callbacks.onClick) callbacks.onClick(x, y);
    // A click low on the screen ducks; anywhere else jumps.
    if (y > canvas.height * 0.72) {
      state.duckHeld = true;
    } else {
      queueJump();
    }
  }

  function onPointerUp() {
    state.duckHeld = false;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);

  return {
    get jumpQueued() { return state.jumpQueued; },
    consumeJump() { state.jumpQueued = false; },
    get duckHeld() { return state.duckHeld; },
    get anyKeyPressed() { return state.anyKeyPressed; },
    clearAnyKey() { state.anyKeyPressed = false; },
  };
}
