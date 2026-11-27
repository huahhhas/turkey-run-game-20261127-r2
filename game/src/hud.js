// HUD and screens: the score / distance / lives / zone / farmer-gap bar
// during a run, and the title, pause, caught and escaped screens with
// buttons the mouse can click. Text is drawn big and readable at a glance.
import { CANVAS_WIDTH, CANVAS_HEIGHT, GOAL_DISTANCE_M, START_FARMER_GAP, FARMER_MAX_GAP } from './config.js';

function roundedPanel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(20, 12, 6, 0.55)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
}

function drawHearts(ctx, lives, x, y) {
  for (let i = 0; i < 3; i++) {
    const hx = x + i * 34;
    ctx.fillStyle = i < lives ? '#e63946' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.moveTo(hx, y + 8);
    ctx.bezierCurveTo(hx - 12, y - 4, hx - 22, y + 6, hx, y + 20);
    ctx.bezierCurveTo(hx + 22, y + 6, hx + 12, y - 4, hx, y + 8);
    ctx.fill();
  }
}

export function drawHud(ctx, state) {
  // Top bar: score, distance, lives, zone.
  roundedPanel(ctx, 16, 14, 560, 64);
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText(`SCORE ${state.score}`, 32, 40);
  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = '#ffd60a';
  ctx.fillText(`${Math.floor(state.distanceM)} m`, 32, 66);
  drawHearts(ctx, state.lives, 250, 26);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(state.zoneName, 380, 40);
  ctx.font = '16px sans-serif';
  ctx.fillStyle = '#ffb703';
  ctx.fillText(`corn ${state.corn}   feathers ${state.feathers}`, 380, 64);

  // Progress bar to freedom (top centre-right).
  const barX = 600;
  const barW = CANVAS_WIDTH - barX - 24;
  roundedPanel(ctx, barX, 14, barW, 64);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ESCAPE', barX + 16, 40);
  const progress = Math.min(1, state.distanceM / GOAL_DISTANCE_M);
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.roundRect(barX + 16, 48, barW - 32, 14, 7);
  ctx.fill();
  ctx.fillStyle = '#80b918';
  ctx.beginPath();
  ctx.roundRect(barX + 16, 48, (barW - 32) * progress, 14, 7);
  ctx.fill();
  // Turkey marker on the progress bar.
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(barX + 16 + (barW - 32) * progress, 55, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7a4a21';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('T', barX + 16 + (barW - 32) * progress, 59);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('FREEDOM', barX + barW - 96, 40);

  // Farmer gap meter (bottom left): how close the farmer is.
  roundedPanel(ctx, 16, CANVAS_HEIGHT - 64, 320, 48);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('FARMER', 30, CANVAS_HEIGHT - 36);
  const gapRatio = Math.max(0, Math.min(1, state.farmerGap / FARMER_MAX_GAP));
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.roundRect(120, CANVAS_HEIGHT - 46, 180, 14, 7);
  ctx.fill();
  ctx.fillStyle = gapRatio > 0.5 ? '#80b918' : gapRatio > 0.25 ? '#ffb703' : '#e63946';
  ctx.beginPath();
  ctx.roundRect(120, CANVAS_HEIGHT - 46, 180 * gapRatio, 14, 7);
  ctx.fill();
  if (gapRatio <= 0.25) {
    ctx.fillStyle = '#ff6b6b';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText("HE'S RIGHT BEHIND YOU!", 120, CANVAS_HEIGHT - 52);
  }

  // Hint line.
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '15px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('SPACE / CLICK jump  •  SPACE again to flap  •  hold ↓ to duck & hide  •  P pause  •  M sound', CANVAS_WIDTH - 20, CANVAS_HEIGHT - 24);
  ctx.textAlign = 'left';
}

function drawButton(ctx, button) {
  ctx.fillStyle = button.hover ? '#ffd60a' : '#ffb703';
  ctx.beginPath();
  ctx.roundRect(button.x, button.y, button.w, button.h, 14);
  ctx.fill();
  ctx.strokeStyle = '#7a4a21';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#3a1c00';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(button.label, button.x + button.w / 2, button.y + button.h / 2 + 9);
  ctx.textAlign = 'left';
}

function centrePanel(ctx, title, titleColour, lines, buttons) {
  ctx.fillStyle = 'rgba(20, 10, 4, 0.62)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  const panelW = 760;
  const panelH = 200 + lines.length * 34 + buttons.length * 74;
  const panelX = (CANVAS_WIDTH - panelW) / 2;
  const panelY = (CANVAS_HEIGHT - panelH) / 2;
  ctx.fillStyle = 'rgba(255, 248, 235, 0.96)';
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelW, panelH, 20);
  ctx.fill();
  ctx.strokeStyle = '#d4a017';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = titleColour;
  ctx.font = 'bold 52px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, CANVAS_WIDTH / 2, panelY + 78);
  ctx.fillStyle = '#3a1c00';
  ctx.font = '22px sans-serif';
  lines.forEach((line, i) => {
    ctx.fillText(line, CANVAS_WIDTH / 2, panelY + 128 + i * 34);
  });
  buttons.forEach((button, i) => {
    button.x = CANVAS_WIDTH / 2 - 170;
    button.y = panelY + 128 + lines.length * 34 + i * 74;
    button.w = 340;
    button.h = 58;
    drawButton(ctx, button);
  });
  ctx.textAlign = 'left';
  return buttons;
}

export function drawTitleScreen(ctx, state, buttons) {
  // Big title over the farmyard, with the turkey front and centre.
  ctx.fillStyle = 'rgba(20, 10, 4, 0.35)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 92px sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 18;
  ctx.fillText('GOBBLE DASH', CANVAS_WIDTH / 2, 150);
  ctx.font = 'bold 40px sans-serif';
  ctx.fillStyle = '#ffd60a';
  ctx.fillText('— A TURKEY ESCAPE —', CANVAS_WIDTH / 2, 208);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#fff';
  ctx.font = '24px sans-serif';
  ctx.fillText('Thanksgiving is coming. The farmer is coming faster.', CANVAS_WIDTH / 2, 268);
  ctx.fillText('Outrun him through the farmyard, the cornfield and the kitchen —', CANVAS_WIDTH / 2, 300);
  ctx.fillText('and do NOT end up in the oven.', CANVAS_WIDTH / 2, 332);
  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = '#ffe8a3';
  ctx.fillText('SPACE / CLICK — jump (again to flap)    ↓ — duck & hide in haystacks', CANVAS_WIDTH / 2, 392);
  ctx.fillText('Grab corn, dodge ovens, fences and falling carving knives.', CANVAS_WIDTH / 2, 424);
  buttons.forEach((button) => {
    button.x = CANVAS_WIDTH / 2 - 170;
    button.y = 470;
    button.w = 340;
    button.h = 64;
    drawButton(ctx, button);
  });
  ctx.font = '18px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('Reach 1000 m to escape. 3 lives. The farmer never stops.', CANVAS_WIDTH / 2, 580);
  ctx.textAlign = 'left';
}

export function drawPauseScreen(ctx, buttons) {
  return centrePanel(ctx, 'PAUSED', '#7a4a21', ['Take a breath. The farmer waits for no turkey.', 'Press P or click Resume to keep running.'], buttons);
}

export function drawCaughtScreen(ctx, state, buttons) {
  return centrePanel(ctx, 'CAUGHT!', '#d62828', [
    `The farmer got you at ${Math.floor(state.distanceM)} m — so close to freedom.`,
    `Score ${state.score}  •  corn ${state.corn}  •  golden feathers ${state.feathers}`,
    'The oven was preheated. The carving knife was sharpened. Try again?',
  ], buttons);
}

export function drawEscapedScreen(ctx, state, buttons) {
  return centrePanel(ctx, 'ESCAPED!', '#2d6a2d', [
    'You made it 1000 m — past the farm, past the kitchen, into the wild!',
    `Score ${state.score}  •  corn ${state.corn}  •  golden feathers ${state.feathers}`,
    'Thanksgiving is cancelled. This turkey lives to gobble another day.',
  ], buttons);
}
