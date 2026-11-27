// Obstacles: wooden fences, pumpkins, glowing ovens and falling carving
// knives — plus haystacks, which are not obstacles at all but hiding spots.
// Spawning is seeded, so the same seed replays the same farm.
import { GROUND_Y, CANVAS_WIDTH } from './config.js';
import { pickFrom, rangeRandom } from './random.js';

const FENCE = 'fence';
const PUMPKIN = 'pumpkin';
const OVEN = 'oven';
const KNIFE = 'knife';
const HAYSTACK = 'haystack';

export function createObstacleField(random) {
  const obstacles = [];
  let spawnIn = 420; // px until the next spawn
  let knifeWarning = null; // a falling knife telegraphs before it drops

  function reset() {
    obstacles.length = 0;
    spawnIn = 420;
    knifeWarning = null;
  }

  function spawnPattern(distanceM, zoneIndex) {
    // Difficulty grows per zone: tighter gaps, taller ovens, more knives.
    const roll = random();
    if (zoneIndex === 0) {
      return pickFrom(random, [FENCE, PUMPKIN, HAYSTACK, FENCE, PUMPKIN]);
    }
    if (zoneIndex === 1) {
      if (roll < 0.3) return FENCE;
      if (roll < 0.55) return PUMPKIN;
      if (roll < 0.72) return KNIFE;
      if (roll < 0.88) return HAYSTACK;
      return OVEN;
    }
    if (roll < 0.22) return FENCE;
    if (roll < 0.42) return OVEN;
    if (roll < 0.66) return KNIFE;
    if (roll < 0.82) return PUMPKIN;
    return HAYSTACK;
  }

  function spawn(distanceM, zoneIndex) {
    const kind = spawnPattern(distanceM, zoneIndex);
    const x = CANVAS_WIDTH + 80;
    if (kind === FENCE) {
      obstacles.push({ kind, x, y: GROUND_Y, w: 46, h: 74, hit: false });
    } else if (kind === PUMPKIN) {
      obstacles.push({ kind, x, y: GROUND_Y, w: 62, h: 52, hit: false });
    } else if (kind === OVEN) {
      // A hot oven: tall enough that only a jump + flap clears it.
      obstacles.push({ kind, x, y: GROUND_Y, w: 86, h: 118, hit: false, glow: random() * Math.PI * 2 });
    } else if (kind === KNIFE) {
      knifeWarning = { x: x + 120, timer: 55, landed: false };
    } else if (kind === HAYSTACK) {
      obstacles.push({ kind, x, y: GROUND_Y, w: 110, h: 84, hit: false, hideUsed: false });
    }
    spawnIn = rangeRandom(random, 380, 620) - zoneIndex * 40;
  }

  function update(speed, distanceM, zoneIndex) {
    spawnIn -= speed;
    if (spawnIn <= 0) spawn(distanceM, zoneIndex);
    for (const obstacle of obstacles) obstacle.x -= speed;
    if (knifeWarning) {
      knifeWarning.x -= speed;
      knifeWarning.timer -= 1;
      if (knifeWarning.timer <= 0 && !knifeWarning.landed) {
        knifeWarning.landed = true;
        obstacles.push({ kind: KNIFE, x: knifeWarning.x, y: 60, w: 34, h: 120, vy: 16, hit: false, stuck: false });
        knifeWarning = null;
      }
    }
    for (const obstacle of obstacles) {
      if (obstacle.kind === KNIFE && !obstacle.stuck) {
        obstacle.y += obstacle.vy;
        if (obstacle.y + obstacle.h >= GROUND_Y) {
          obstacle.y = GROUND_Y - obstacle.h;
          obstacle.stuck = true;
        }
      }
      if (obstacle.kind === OVEN) obstacle.glow += 0.06;
    }
    for (let i = obstacles.length - 1; i >= 0; i--) {
      if (obstacles[i].x < -220) obstacles.splice(i, 1);
    }
  }

  function boundsOf(obstacle) {
    if (obstacle.kind === KNIFE) {
      return { x: obstacle.x - 14, y: obstacle.y, w: 28, h: obstacle.h };
    }
    return { x: obstacle.x - obstacle.w / 2, y: obstacle.y - obstacle.h, w: obstacle.w, h: obstacle.h };
  }

  function drawHaystack(ctx, o) {
    ctx.fillStyle = '#e9c46a';
    ctx.beginPath();
    ctx.moveTo(o.x - o.w / 2, o.y);
    ctx.quadraticCurveTo(o.x - o.w * 0.42, o.y - o.h * 1.15, o.x, o.y - o.h);
    ctx.quadraticCurveTo(o.x + o.w * 0.42, o.y - o.h * 1.15, o.x + o.w / 2, o.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b98a2f';
    ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(o.x + i * 16, o.y - o.h * 0.15);
      ctx.lineTo(o.x + i * 10, o.y - o.h * 0.85);
      ctx.stroke();
    }
    ctx.fillStyle = '#7b5e1e';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HIDE!  (hold ↓)', o.x, o.y - o.h - 12);
  }

  function drawFence(ctx, o) {
    ctx.fillStyle = '#8b5e34';
    ctx.fillRect(o.x - o.w / 2, o.y - o.h, 10, o.h);
    ctx.fillRect(o.x + o.w / 2 - 10, o.y - o.h, 10, o.h);
    ctx.fillStyle = '#a06b3a';
    ctx.fillRect(o.x - o.w / 2 - 4, o.y - o.h + 8, o.w + 8, 12);
    ctx.fillRect(o.x - o.w / 2 - 4, o.y - o.h + 36, o.w + 8, 12);
  }

  function drawPumpkin(ctx, o) {
    ctx.fillStyle = '#e76f1e';
    ctx.beginPath();
    ctx.ellipse(o.x, o.y - o.h / 2, o.w / 2, o.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c85a12';
    ctx.lineWidth = 3;
    for (const dx of [-16, 0, 16]) {
      ctx.beginPath();
      ctx.ellipse(o.x + dx, o.y - o.h / 2, 10, o.h / 2 - 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#2d6a2d';
    ctx.fillRect(o.x - 3, o.y - o.h - 8, 6, 12);
    // Grinning jack-o'-lantern face in the kitchen zone's honour.
    ctx.fillStyle = '#3a1c00';
    ctx.beginPath();
    ctx.moveTo(o.x - 18, o.y - o.h / 2 - 8);
    ctx.lineTo(o.x - 10, o.y - o.h / 2 - 2);
    ctx.lineTo(o.x - 18, o.y - o.h / 2 + 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(o.x + 18, o.y - o.h / 2 - 8);
    ctx.lineTo(o.x + 10, o.y - o.h / 2 - 2);
    ctx.lineTo(o.x + 18, o.y - o.h / 2 + 2);
    ctx.closePath();
    ctx.fill();
  }

  function drawOven(ctx, o) {
    const heat = 0.5 + Math.sin(o.glow) * 0.5;
    ctx.fillStyle = '#3d3d3d';
    ctx.beginPath();
    ctx.roundRect(o.x - o.w / 2, o.y - o.h, o.w, o.h, 8);
    ctx.fill();
    // Glowing door: the turkey must never become dinner.
    ctx.fillStyle = `rgba(255, ${Math.floor(120 + heat * 100)}, 0, ${0.75 + heat * 0.25})`;
    ctx.beginPath();
    ctx.roundRect(o.x - o.w / 2 + 12, o.y - o.h + 34, o.w - 24, 52, 6);
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(o.x - o.w / 2 + 12, o.y - o.h + 60);
    ctx.lineTo(o.x + o.w / 2 - 12, o.y - o.h + 60);
    ctx.stroke();
    // Heat waves.
    ctx.strokeStyle = `rgba(255, 140, 0, ${0.4 + heat * 0.4})`;
    ctx.lineWidth = 3;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(o.x + i * 24, o.y - o.h - 6);
      ctx.quadraticCurveTo(o.x + i * 24 + 8, o.y - o.h - 18, o.x + i * 24, o.y - o.h - 30);
      ctx.stroke();
    }
    ctx.fillStyle = '#ffb703';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HOT OVEN!', o.x, o.y - o.h - 38);
  }

  function drawKnife(ctx, o) {
    ctx.fillStyle = '#e8e8e8';
    ctx.beginPath();
    ctx.moveTo(o.x - 14, o.y);
    ctx.lineTo(o.x + 14, o.y);
    ctx.lineTo(o.x + 8, o.y + o.h - 26);
    ctx.lineTo(o.x, o.y + o.h - 14);
    ctx.lineTo(o.x - 8, o.y + o.h - 26);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#5d3a1a';
    ctx.beginPath();
    ctx.roundRect(o.x - 12, o.y + o.h - 16, 24, 16, 4);
    ctx.fill();
  }

  function draw(ctx) {
    if (knifeWarning) {
      // Telegraph: a red danger marker where the knife will land.
      const alpha = 0.35 + 0.3 * Math.sin(knifeWarning.timer * 0.4);
      ctx.fillStyle = `rgba(214, 40, 40, ${alpha})`;
      ctx.beginPath();
      ctx.moveTo(knifeWarning.x, GROUND_Y - 46);
      ctx.lineTo(knifeWarning.x - 16, GROUND_Y - 78);
      ctx.lineTo(knifeWarning.x + 16, GROUND_Y - 78);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d62828';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', knifeWarning.x, GROUND_Y - 84);
    }
    for (const obstacle of obstacles) {
      if (obstacle.kind === FENCE) drawFence(ctx, obstacle);
      else if (obstacle.kind === PUMPKIN) drawPumpkin(ctx, obstacle);
      else if (obstacle.kind === OVEN) drawOven(ctx, obstacle);
      else if (obstacle.kind === KNIFE) drawKnife(ctx, obstacle);
      else if (obstacle.kind === HAYSTACK) drawHaystack(ctx, obstacle);
    }
  }

  return { obstacles, reset, update, draw, boundsOf };
}
