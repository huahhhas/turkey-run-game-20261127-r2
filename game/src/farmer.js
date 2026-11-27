// The farmer: he chases from the left edge, gap shown on the HUD. He
// sprints when the turkey stumbles, slows when the turkey pulls away, and
// shouts when he spots the bird. If he reaches the turkey, dinner is served.
import { GROUND_Y, FARMER_CATCH_GAP, FARMER_MAX_GAP } from './config.js';

export function createFarmer() {
  const farmer = {
    gap: 260, // pixels behind the turkey
    runPhase: 0,
    shoutTimer: 0,
    caughtTurkey: false,
  };

  function reset(startGap) {
    farmer.gap = startGap;
    farmer.runPhase = 0;
    farmer.shoutTimer = 0;
    farmer.caughtTurkey = false;
  }

  function update(speed, deltaGap) {
    farmer.gap = Math.max(FARMER_CATCH_GAP, Math.min(FARMER_MAX_GAP, farmer.gap + deltaGap));
    farmer.runPhase += speed * 0.11;
    if (farmer.shoutTimer > 0) farmer.shoutTimer -= 1;
    if (farmer.gap <= FARMER_CATCH_GAP) farmer.caughtTurkey = true;
  }

  function shout(sound) {
    farmer.shoutTimer = 50;
    if (sound) sound.spotted();
  }

  function draw(ctx, turkeyX) {
    const x = turkeyX - farmer.gap - 40;
    if (x < -160) return; // off-screen left, still chasing
    const y = GROUND_Y;
    const swing = Math.sin(farmer.runPhase) * 12;
    ctx.save();
    ctx.translate(x, y);

    // Shout bubble when he closes in.
    if (farmer.shoutTimer > 0) {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(6, -168, 118, 40, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#d62828';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('COME BACK!', 65, -141);
    }

    // Legs: blue overalls, running hard.
    ctx.strokeStyle = '#2b4c7e';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-4, -58);
    ctx.lineTo(-4 + swing, 0);
    ctx.moveTo(6, -58);
    ctx.lineTo(6 - swing, 0);
    ctx.stroke();

    // Body: red plaid shirt.
    ctx.fillStyle = '#c1272d';
    ctx.beginPath();
    ctx.roundRect(-20, -108, 44, 54, 10);
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-20, -88);
    ctx.lineTo(24, -88);
    ctx.moveTo(-20, -68);
    ctx.lineTo(24, -68);
    ctx.stroke();

    // Arms pumping; right hand holds a carving knife.
    ctx.strokeStyle = '#c1272d';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(18, -100);
    ctx.lineTo(34 - swing * 0.6, -78);
    ctx.moveTo(-16, -100);
    ctx.lineTo(-32 + swing * 0.6, -80);
    ctx.stroke();
    // Carving knife glinting in his hand.
    ctx.save();
    ctx.translate(34 - swing * 0.6, -78);
    ctx.rotate(0.5);
    ctx.fillStyle = '#e8e8e8';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(26, -5);
    ctx.lineTo(26, 3);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5d3a1a';
    ctx.fillRect(-8, -4, 9, 8);
    ctx.restore();

    // Head with straw hat.
    ctx.fillStyle = '#f2c29b';
    ctx.beginPath();
    ctx.arc(4, -122, 14, 0, Math.PI * 2);
    ctx.fill();
    // Beard.
    ctx.fillStyle = '#e8e8e8';
    ctx.beginPath();
    ctx.ellipse(6, -110, 10, 8, 0, 0, Math.PI);
    ctx.fill();
    // Straw hat.
    ctx.fillStyle = '#e9c46a';
    ctx.beginPath();
    ctx.ellipse(4, -134, 26, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d4a017';
    ctx.beginPath();
    ctx.ellipse(4, -138, 13, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  return { farmer, reset, update, shout, draw };
}
