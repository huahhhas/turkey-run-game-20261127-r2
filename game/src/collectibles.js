// Collectibles: corn cobs worth points (and a little farmer distance) and
// rare golden feathers worth a lot. They float in arcs the turkey jumps for.
import { GROUND_Y, CANVAS_WIDTH } from './config.js';
import { rangeRandom } from './random.js';

export function createCollectibles(random) {
  const items = [];
  let spawnIn = 300;

  function reset() {
    items.length = 0;
    spawnIn = 300;
  }

  function spawn() {
    const isFeather = random() < 0.16;
    const baseX = CANVAS_WIDTH + 60;
    const count = isFeather ? 1 : 3;
    const arcHeight = rangeRandom(random, 90, 170);
    for (let i = 0; i < count; i++) {
      items.push({
        kind: isFeather ? 'feather' : 'corn',
        x: baseX + i * 52,
        y: GROUND_Y - 70 - Math.sin((i / Math.max(1, count - 1)) * Math.PI) * arcHeight,
        taken: false,
        bob: random() * Math.PI * 2,
      });
    }
    spawnIn = rangeRandom(random, 420, 760);
  }

  function update(speed) {
    spawnIn -= speed;
    if (spawnIn <= 0) spawn();
    for (const item of items) {
      item.x -= speed;
      item.bob += 0.08;
    }
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].x < -60) items.splice(i, 1);
    }
  }

  function drawCorn(ctx, item) {
    const y = item.y + Math.sin(item.bob) * 4;
    ctx.fillStyle = '#ffd60a';
    ctx.beginPath();
    ctx.ellipse(item.x, y, 12, 20, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#d4a017';
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(item.x - 8, y + i * 8);
      ctx.lineTo(item.x + 8, y + i * 8 - 4);
      ctx.stroke();
    }
    ctx.fillStyle = '#2d6a2d';
    ctx.beginPath();
    ctx.ellipse(item.x, y + 22, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawFeather(ctx, item) {
    const y = item.y + Math.sin(item.bob) * 5;
    ctx.save();
    ctx.translate(item.x, y);
    ctx.rotate(0.4 + Math.sin(item.bob) * 0.15);
    ctx.fillStyle = '#ffd60a';
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(0, 22);
    ctx.stroke();
    ctx.restore();
    ctx.fillStyle = '#7a4a21';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('+50', item.x, y - 32);
  }

  function draw(ctx) {
    for (const item of items) {
      if (item.kind === 'corn') drawCorn(ctx, item);
      else drawFeather(ctx, item);
    }
  }

  return { items, reset, update, draw };
}
