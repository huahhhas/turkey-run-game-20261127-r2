// The world: a scrolling autumn landscape that changes with the zone —
// farmyard fences and a red barn, then tall corn, then the farmhouse
// kitchen with its table, window and hanging pots.
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, ZONES } from './config.js';

export function createWorld(random) {
  // Pre-scattered scenery so the parallax never pops.
  const clouds = [];
  const trees = [];
  const cornStalks = [];
  for (let i = 0; i < 7; i++) {
    clouds.push({ x: random() * CANVAS_WIDTH, y: 40 + random() * 130, scale: 0.7 + random() * 0.8, speed: 0.3 });
  }
  for (let i = 0; i < 12; i++) {
    trees.push({ x: random() * CANVAS_WIDTH, height: 90 + random() * 70 });
  }
  for (let i = 0; i < 26; i++) {
    cornStalks.push({ x: random() * CANVAS_WIDTH, height: 130 + random() * 60, lean: (random() - 0.5) * 0.3 });
  }

  function drawSky(ctx, zone) {
    const gradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    gradient.addColorStop(0, zone.skyTop);
    gradient.addColorStop(1, zone.skyBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);
    // Low autumn sun.
    ctx.fillStyle = '#fff3b0';
    ctx.beginPath();
    ctx.arc(1080, 110, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 243, 176, 0.35)';
    ctx.beginPath();
    ctx.arc(1080, 110, 78, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawClouds(ctx, scrollX) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (const cloud of clouds) {
      const x = (((cloud.x - scrollX * cloud.speed) % (CANVAS_WIDTH + 240)) + CANVAS_WIDTH + 240) % (CANVAS_WIDTH + 240) - 120;
      const s = cloud.scale;
      ctx.beginPath();
      ctx.ellipse(x, cloud.y, 52 * s, 20 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(x - 34 * s, cloud.y + 8 * s, 32 * s, 15 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 34 * s, cloud.y + 8 * s, 32 * s, 15 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawFarmyard(ctx, scrollX) {
    // Red barn on the horizon.
    const barnX = (((200 - scrollX * 0.25) % (CANVAS_WIDTH + 600)) + CANVAS_WIDTH + 600) % (CANVAS_WIDTH + 600) - 300;
    ctx.fillStyle = '#a4133c';
    ctx.fillRect(barnX, 380, 220, 180);
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(barnX - 12, 384);
    ctx.lineTo(barnX + 110, 300);
    ctx.lineTo(barnX + 232, 384);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(barnX + 88, 470, 44, 90);
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(barnX + 88, 515);
    ctx.lineTo(barnX + 132, 515);
    ctx.moveTo(barnX + 110, 470);
    ctx.lineTo(barnX + 110, 560);
    ctx.stroke();
    // Distant trees.
    ctx.fillStyle = '#5d3a1a';
    for (const tree of trees) {
      const x = (((tree.x - scrollX * 0.4) % (CANVAS_WIDTH + 200)) + CANVAS_WIDTH + 200) % (CANVAS_WIDTH + 200) - 100;
      ctx.fillRect(x - 4, GROUND_Y - tree.height * 0.5, 8, tree.height * 0.5);
      ctx.fillStyle = '#c96f2e';
      ctx.beginPath();
      ctx.arc(x, GROUND_Y - tree.height * 0.62, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#5d3a1a';
    }
  }

  function drawCornfield(ctx, scrollX) {
    ctx.fillStyle = '#4c7a1f';
    for (const stalk of cornStalks) {
      const x = (((stalk.x - scrollX * 0.55) % (CANVAS_WIDTH + 120)) + CANVAS_WIDTH + 120) % (CANVAS_WIDTH + 120) - 60;
      ctx.save();
      ctx.translate(x, GROUND_Y);
      ctx.rotate(stalk.lean);
      ctx.fillStyle = '#2d6a2d';
      ctx.fillRect(-3, -stalk.height, 6, stalk.height);
      ctx.fillStyle = '#ffd60a';
      ctx.beginPath();
      ctx.ellipse(10, -stalk.height * 0.55, 9, 22, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4c7a1f';
      ctx.beginPath();
      ctx.ellipse(-12, -stalk.height * 0.4, 16, 7, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawKitchen(ctx, scrollX) {
    // Warm kitchen interior: window, table, hanging pots, tiled floor line.
    ctx.fillStyle = '#8d3b2f';
    ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);
    ctx.fillStyle = '#6b2d24';
    for (let x = 0; x < CANVAS_WIDTH; x += 96) {
      ctx.fillRect(x, 0, 4, GROUND_Y);
    }
    // Window with evening sky.
    const winX = 880 - ((scrollX * 0.2) % 300);
    ctx.fillStyle = '#f7b267';
    ctx.beginPath();
    ctx.roundRect(winX, 120, 190, 150, 8);
    ctx.fill();
    ctx.strokeStyle = '#5d3a1a';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(winX + 95, 120);
    ctx.lineTo(winX + 95, 270);
    ctx.moveTo(winX, 195);
    ctx.lineTo(winX + 190, 195);
    ctx.stroke();
    // Hanging copper pots.
    for (let i = 0; i < 4; i++) {
      const px = 140 + i * 90 - ((scrollX * 0.15) % 90);
      ctx.strokeStyle = '#3a1c00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, 60);
      ctx.stroke();
      ctx.fillStyle = '#b87333';
      ctx.beginPath();
      ctx.arc(px, 92, 26, 0, Math.PI);
      ctx.fill();
      ctx.fillRect(px - 26, 66, 52, 10);
    }
    // Long wooden table edge at the back.
    ctx.fillStyle = '#6b4226';
    ctx.fillRect(0, 470, CANVAS_WIDTH, 26);
    ctx.fillStyle = '#8b5e34';
    ctx.fillRect(0, 470, CANVAS_WIDTH, 10);
  }

  function drawGround(ctx, zone, scrollX) {
    ctx.fillStyle = zone.ground;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    ctx.fillStyle = zone.accent;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 6);
    // Dirt tufts / floor boards scrolling past.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    for (let x = -((scrollX % 140) + 140) % 140; x < CANVAS_WIDTH; x += 140) {
      ctx.fillRect(x, GROUND_Y + 46, 46, 6);
    }
  }

  function draw(ctx, zone, zoneIndex, scrollX) {
    if (zoneIndex === 2) {
      drawKitchen(ctx, scrollX);
    } else {
      drawSky(ctx, zone);
      drawClouds(ctx, scrollX);
      if (zoneIndex === 0) drawFarmyard(ctx, scrollX);
      else drawCornfield(ctx, scrollX);
    }
    drawGround(ctx, zone, scrollX);
  }

  return { draw };
}
