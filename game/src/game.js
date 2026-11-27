// Gobble Dash — Turkey Escape: the game itself. Owns the state machine
// (title -> playing -> paused / caught / escaped), the main loop, collisions,
// scoring, the farmer-gap chase and the deterministic screenshot mode
// (?shot=start|play|caught|escaped&seed=N) used to take the entry's shots.
import {
  CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, GOAL_DISTANCE_M, START_LIVES,
  START_FARMER_GAP, FARMER_MAX_GAP, GAP_LOSS_ON_HIT, GAP_GAIN_PER_CORN,
  GAP_GAIN_PER_FEATHER, GAP_GAIN_HIDE, GAP_RECOVERY_PER_SECOND,
  SCORE_PER_METRE, SCORE_PER_CORN, SCORE_PER_FEATHER,
  BASE_SPEED, SPEED_PER_ZONE, zoneFor, zoneIndexFor,
} from './config.js';
import { createSeededRandom } from './random.js';
import { createInput } from './input.js';
import { createSoundBank } from './audio.js';
import { createTurkey } from './turkey.js';
import { createFarmer } from './farmer.js';
import { createObstacleField } from './obstacles.js';
import { createCollectibles } from './collectibles.js';
import { createWorld } from './world.js';
import { drawHud, drawTitleScreen, drawPauseScreen, drawCaughtScreen, drawEscapedScreen } from './hud.js';

const METRES_PER_PIXEL = 0.1;
const INVULNERABLE_FRAMES = 70;

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function startGame(canvas) {
  const ctx = canvas.getContext('2d');
  const params = new URLSearchParams(window.location.search);
  const seed = Number(params.get('seed') || 7);
  const shotMode = params.get('shot'); // start | play | caught | escaped
  const random = createSeededRandom(seed);
  const sound = createSoundBank();
  const turkey = createTurkey();
  const farmer = createFarmer();
  const obstacles = createObstacleField(random);
  const collectibles = createCollectibles(random);
  const world = createWorld(random);

  const state = {
    mode: 'title',
    score: 0,
    distanceM: 0,
    lives: START_LIVES,
    corn: 0,
    feathers: 0,
    farmerGap: START_FARMER_GAP,
    zoneName: 'FARMYARD',
    zoneIndex: 0,
    speed: BASE_SPEED,
    scrollX: 0,
    frame: 0,
    hideTimer: 0,
    invulnerableTimer: 0,
    muted: false,
  };

  const buttons = {
    title: [{ id: 'play', label: '▶  START THE ESCAPE' }],
    pause: [
      { id: 'resume', label: 'RESUME' },
      { id: 'restart', label: 'RESTART' },
    ],
    caught: [{ id: 'restart', label: '↻  RUN AGAIN' }],
    escaped: [{ id: 'restart', label: '↻  RUN AGAIN' }],
  };
  let activeButtons = buttons.title;

  function resetRun() {
    state.mode = 'playing';
    state.score = 0;
    state.distanceM = 0;
    state.lives = START_LIVES;
    state.corn = 0;
    state.feathers = 0;
    state.farmerGap = START_FARMER_GAP;
    state.zoneIndex = 0;
    state.zoneName = 'FARMYARD';
    state.speed = BASE_SPEED;
    state.scrollX = 0;
    state.frame = 0;
    state.hideTimer = 0;
    state.invulnerableTimer = 0;
    turkey.reset();
    farmer.reset(START_FARMER_GAP);
    obstacles.reset();
    collectibles.reset();
  }

  function endCaught() {
    state.mode = 'caught';
    activeButtons = buttons.caught;
    sound.caught();
    sound.gobble();
  }

  function endEscaped() {
    state.mode = 'escaped';
    activeButtons = buttons.escaped;
    sound.escaped();
  }

  function takeHit(obstacle) {
    if (state.invulnerableTimer > 0) return;
    obstacle.hit = true;
    state.lives -= 1;
    state.farmerGap = Math.max(0, state.farmerGap - GAP_LOSS_ON_HIT);
    state.invulnerableTimer = INVULNERABLE_FRAMES;
    turkey.hurt();
    sound.thud();
    farmer.shout(sound);
    if (state.lives <= 0 || state.farmerGap <= 0) endCaught();
  }

  function tryHide() {
    // Ducking beside a fresh haystack hides the turkey; the farmer runs past.
    if (state.hideTimer > 0 || turkey.turkey.hidden) return false;
    for (const obstacle of obstacles.obstacles) {
      if (obstacle.kind !== 'haystack' || obstacle.hideUsed) continue;
      if (Math.abs(obstacle.x - turkey.turkey.x) < 90) {
        obstacle.hideUsed = true;
        turkey.turkey.hidden = true;
        state.hideTimer = 90;
        state.farmerGap = Math.min(FARMER_MAX_GAP, state.farmerGap + GAP_GAIN_HIDE);
        sound.hide();
        return true;
      }
    }
    return false;
  }

  function autoPlay() {
    // Screenshot-mode driver: jumps for obstacles, ducks for haystacks.
    const tb = turkey.bounds();
    for (const obstacle of obstacles.obstacles) {
      if (obstacle.kind === 'haystack') {
        if (obstacle.x - turkey.turkey.x < 70 && obstacle.x > turkey.turkey.x - 40) return 'duck';
        continue;
      }
      const ob = obstacles.boundsOf(obstacle);
      const gap = ob.x - (tb.x + tb.w);
      if (gap > 0 && gap < (obstacle.kind === 'oven' ? 240 : 170) && turkey.turkey.grounded) return 'jump';
      if (obstacle.kind === 'knife' && !obstacle.stuck && gap > 0 && gap < 200) return 'jump';
    }
    return null;
  }

  function update() {
    state.frame += 1;
    state.zoneIndex = zoneIndexFor(state.distanceM);
    const zone = zoneFor(state.distanceM);
    state.zoneName = zone.name;
    state.speed = BASE_SPEED + state.zoneIndex * SPEED_PER_ZONE;
    state.scrollX += state.speed;
    state.distanceM += state.speed * METRES_PER_PIXEL;
    state.score = Math.floor(state.distanceM * SCORE_PER_METRE) + state.corn * SCORE_PER_CORN + state.feathers * SCORE_PER_FEATHER;

    // The farmer slowly loses ground to a clean runner, closes on mistakes.
    state.farmerGap = Math.min(FARMER_MAX_GAP, state.farmerGap + GAP_RECOVERY_PER_SECOND / 60);
    farmer.update(state.speed, state.farmerGap - farmer.farmer.gap);

    if (state.hideTimer > 0) {
      state.hideTimer -= 1;
      if (state.hideTimer === 0) turkey.turkey.hidden = false;
    }
    if (state.invulnerableTimer > 0) state.invulnerableTimer -= 1;

    if (input.jumpQueued) {
      input.consumeJump();
      if (state.hideTimer <= 0) turkey.jump(sound);
    }
    if (input.duckHeld) tryHide();
    turkey.update(input.duckHeld, state.speed);
    obstacles.update(state.speed, state.distanceM, state.zoneIndex);
    collectibles.update(state.speed);

    // Collisions with obstacles.
    const tb = turkey.bounds();
    if (!turkey.turkey.hidden && state.invulnerableTimer <= 0) {
      for (const obstacle of obstacles.obstacles) {
        if (obstacle.hit || obstacle.kind === 'haystack') continue;
        if (rectsOverlap(tb, obstacles.boundsOf(obstacle))) takeHit(obstacle);
        if (state.mode !== 'playing') return;
      }
    }

    // Collectibles.
    for (const item of collectibles.items) {
      if (item.taken) continue;
      const box = { x: item.x - 18, y: item.y - 24, w: 36, h: 48 };
      if (!turkey.turkey.hidden && rectsOverlap(tb, box)) {
        item.taken = true;
        if (item.kind === 'corn') {
          state.corn += 1;
          state.farmerGap = Math.min(FARMER_MAX_GAP, state.farmerGap + GAP_GAIN_PER_CORN);
          sound.corn();
        } else {
          state.feathers += 1;
          state.farmerGap = Math.min(FARMER_MAX_GAP, state.farmerGap + GAP_GAIN_PER_FEATHER);
          sound.feather();
        }
      }
    }
    for (let i = collectibles.items.length - 1; i >= 0; i--) {
      if (collectibles.items[i].taken) collectibles.items.splice(i, 1);
    }

    if (state.distanceM >= GOAL_DISTANCE_M) endEscaped();
    else if (state.farmerGap <= 0) endCaught();
  }

  function draw() {
    const zone = zoneFor(state.distanceM);
    world.draw(ctx, zone, state.zoneIndex, state.scrollX);
    collectibles.draw(ctx);
    obstacles.draw(ctx);
    farmer.draw(ctx, turkey.turkey.x);
    turkey.draw(ctx);
    if (state.mode === 'playing' || state.mode === 'paused') drawHud(ctx, state);
    if (state.mode === 'title') {
      drawTitleScreen(ctx, state, buttons.title);
      activeButtons = buttons.title;
    } else if (state.mode === 'paused') {
      activeButtons = drawPauseScreen(ctx, buttons.pause);
    } else if (state.mode === 'caught') {
      activeButtons = drawCaughtScreen(ctx, state, buttons.caught);
    } else if (state.mode === 'escaped') {
      activeButtons = drawEscapedScreen(ctx, state, buttons.escaped);
    }
  }

  function handleClick(x, y) {
    sound.unlock();
    if (state.mode === 'title' || state.mode === 'paused' || state.mode === 'caught' || state.mode === 'escaped') {
      for (const button of activeButtons) {
        if (button.x !== undefined && x >= button.x && x <= button.x + button.w && y >= button.y && y <= button.y + button.h) {
          if (button.id === 'play' || button.id === 'restart') {
            resetRun();
            sound.gobble();
          } else if (button.id === 'resume') {
            state.mode = 'playing';
          }
          return;
        }
      }
    }
  }

  function handleAction() {
    sound.unlock();
    if (state.mode === 'title') {
      resetRun();
      sound.gobble();
    } else if (state.mode === 'caught' || state.mode === 'escaped') {
      resetRun();
      sound.gobble();
    }
  }

  const input = createInput(canvas, {
    onAction: handleAction,
    onClick: handleClick,
    onPause: () => {
      if (state.mode === 'playing') {
        state.mode = 'paused';
        activeButtons = buttons.pause;
      } else if (state.mode === 'paused') {
        state.mode = 'playing';
      }
    },
    onRestart: () => { if (state.mode !== 'title') resetRun(); },
    onMute: () => { state.muted = sound.toggleMute(); },
  });

  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    for (const button of activeButtons) {
      button.hover = button.x !== undefined && x >= button.x && x <= button.x + button.w && y >= button.y && y <= button.y + button.h;
    }
  });

  // ---- Deterministic screenshot mode: stage a scene, render once. ----
  function simulateShot() {
    if (shotMode === 'start') {
      state.mode = 'title';
      // Stage a lively farmyard behind the title.
      state.scrollX = 260;
      draw();
    } else if (shotMode === 'play') {
      resetRun();
      let frames = 0;
      while (state.mode === 'playing' && frames < 430) {
        frames += 1;
        const move = autoPlay();
        if (move === 'jump') turkey.jump(null);
        else if (move === 'duck') tryHide();
        update();
      }
      // Stage the moment: mid-run, farmer close, corn collected.
      state.farmerGap = 150;
      farmer.farmer.gap = 150;
      state.corn = 6;
      state.feathers = 1;
      state.score = Math.floor(state.distanceM * SCORE_PER_METRE) + state.corn * SCORE_PER_CORN + state.feathers * SCORE_PER_FEATHER;
      draw();
    } else if (shotMode === 'caught') {
      resetRun();
      let frames = 0;
      while (state.mode === 'playing' && frames < 1200) {
        frames += 1;
        update();
        // Stumble into trouble on purpose: one life left, farmer on the tail.
        if (frames === 500) {
          state.lives = 1;
          state.farmerGap = 40;
        }
      }
      if (state.mode === 'playing') {
        state.lives = 0;
        endCaught();
      }
      draw();
    } else if (shotMode === 'escaped') {
      resetRun();
      let frames = 0;
      while (state.mode === 'playing' && frames < 4000) {
        frames += 1;
        const move = autoPlay();
        if (move === 'jump') turkey.jump(null);
        else if (move === 'duck') tryHide();
        update();
      }
      if (state.mode !== 'escaped') {
        // The auto-player got caught on the way: stage a fresh kitchen
        // scene, then force the escape over the line.
        resetRun();
        for (let i = 0; i < 320 && state.mode === 'playing'; i++) {
          const move = autoPlay();
          if (move === 'jump') turkey.jump(null);
          else if (move === 'duck') tryHide();
          update();
        }
        state.distanceM = GOAL_DISTANCE_M;
        state.zoneIndex = zoneIndexFor(GOAL_DISTANCE_M);
        state.zoneName = zoneFor(GOAL_DISTANCE_M).name;
        state.corn = 12;
        state.feathers = 2;
        state.score = Math.floor(state.distanceM * SCORE_PER_METRE) + state.corn * SCORE_PER_CORN + state.feathers * SCORE_PER_FEATHER;
        endEscaped();
      }
      draw();
    }
    window.__shotReady = true;
  }

  if (shotMode) {
    simulateShot();
    return { state, resetRun };
  }

  // ---- Live play loop. ----
  let lastTime = performance.now();
  function loop(now) {
    const deltaMs = Math.min(50, now - lastTime);
    lastTime = now;
    if (state.mode === 'playing') {
      // Step in fixed 1/60 slices so physics never depends on frame rate.
      let remaining = deltaMs;
      while (remaining >= 16.7) {
        update();
        remaining -= 16.7;
        if (state.mode !== 'playing') break;
      }
    }
    draw();
    requestAnimationFrame(loop);
  }
  draw();
  requestAnimationFrame(loop);
  return { state, resetRun };
}
