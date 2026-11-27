// The turkey: a plump brown bird with a red wattle, blue head and a fan
// tail. Runs, jumps, double-flaps (glide), ducks, and flashes when hurt.
// All art is drawn with canvas paths — no image files.
import { GROUND_Y, GRAVITY, JUMP_VELOCITY, FLAP_VELOCITY, MAX_FALL_SPEED, DUCK_HEIGHT_SCALE } from './config.js';

export function createTurkey() {
  const turkey = {
    x: 300,
    y: GROUND_Y,
    width: 74,
    height: 92,
    vy: 0,
    jumpsUsed: 0,
    ducking: false,
    hidden: false,
    hurtTimer: 0,
    runPhase: 0,
    flapTimer: 0,
    grounded: true,
  };

  function reset() {
    turkey.y = GROUND_Y;
    turkey.vy = 0;
    turkey.jumpsUsed = 0;
    turkey.ducking = false;
    turkey.hidden = false;
    turkey.hurtTimer = 0;
    turkey.runPhase = 0;
    turkey.flapTimer = 0;
    turkey.grounded = true;
  }

  function jump(sound) {
    if (turkey.hidden) return false;
    if (turkey.grounded) {
      turkey.vy = JUMP_VELOCITY;
      turkey.grounded = false;
      turkey.jumpsUsed = 1;
      turkey.flapTimer = 6;
      if (sound) sound.jump();
      return true;
    }
    if (turkey.jumpsUsed < 2) {
      // Second jump is a flap: a short glide that clears tall ovens.
      turkey.vy = FLAP_VELOCITY;
      turkey.jumpsUsed = 2;
      turkey.flapTimer = 10;
      if (sound) sound.flap();
      return true;
    }
    return false;
  }

  function update(duckHeld, speed) {
    turkey.runPhase += speed * 0.09;
    if (turkey.flapTimer > 0) turkey.flapTimer -= 1;
    if (turkey.hurtTimer > 0) turkey.hurtTimer -= 1;
    turkey.ducking = duckHeld && turkey.grounded;
    if (!turkey.grounded) {
      turkey.vy = Math.min(MAX_FALL_SPEED, turkey.vy + GRAVITY);
      turkey.y += turkey.vy;
      if (turkey.y >= GROUND_Y) {
        turkey.y = GROUND_Y;
        turkey.vy = 0;
        turkey.grounded = true;
        turkey.jumpsUsed = 0;
      }
    }
  }

  function hurt() {
    turkey.hurtTimer = 45;
  }

  function height() {
    return turkey.ducking ? turkey.height * DUCK_HEIGHT_SCALE : turkey.height;
  }

  function bounds() {
    const h = height();
    return { x: turkey.x - 26, y: turkey.y - h, w: 58, h };
  }

  function draw(ctx) {
    if (turkey.hidden) return; // tucked inside a haystack
    if (turkey.hurtTimer > 0 && Math.floor(turkey.hurtTimer / 4) % 2 === 0) return; // hurt flash
    const h = height();
    const bob = turkey.grounded ? Math.sin(turkey.runPhase) * 3 : 0;
    const feetLift = turkey.grounded ? Math.abs(Math.sin(turkey.runPhase)) * 8 : 0;
    const x = turkey.x;
    const y = turkey.y + bob;

    ctx.save();
    ctx.translate(x, y);

    // Tail fan: five brown feathers fanning behind.
    for (let i = -2; i <= 2; i++) {
      ctx.save();
      ctx.rotate(i * 0.32);
      ctx.fillStyle = i % 2 === 0 ? '#8b5e34' : '#a06b3a';
      ctx.beginPath();
      ctx.ellipse(-34, -h * 0.62, 9, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d9a066';
      ctx.beginPath();
      ctx.ellipse(-34, -h * 0.85, 5, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Legs.
    ctx.strokeStyle = '#e07b39';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    const legSwing = turkey.grounded ? Math.sin(turkey.runPhase) * 10 : 6;
    ctx.beginPath();
    ctx.moveTo(-6, -14);
    ctx.lineTo(-6 + legSwing, -feetLift);
    ctx.moveTo(8, -14);
    ctx.lineTo(8 - legSwing, -feetLift);
    ctx.stroke();

    // Body: plump brown oval.
    ctx.fillStyle = '#7a4a21';
    ctx.beginPath();
    ctx.ellipse(0, -h * 0.45, 34, h * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    // Belly feathers.
    ctx.fillStyle = '#9c6b3f';
    ctx.beginPath();
    ctx.ellipse(4, -h * 0.32, 24, h * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wing: flaps hard while gliding.
    const wingAngle = turkey.flapTimer > 0 ? -0.9 : Math.sin(turkey.runPhase) * 0.15;
    ctx.save();
    ctx.translate(-4, -h * 0.5);
    ctx.rotate(wingAngle);
    ctx.fillStyle = '#5d3a1a';
    ctx.beginPath();
    ctx.ellipse(-12, 0, 22, 11, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Neck and head.
    ctx.fillStyle = '#7a4a21';
    ctx.fillRect(14, -h - 6, 14, 34);
    // Blue head.
    ctx.fillStyle = '#4a6fa5';
    ctx.beginPath();
    ctx.arc(24, -h - 8, 13, 0, Math.PI * 2);
    ctx.fill();
    // Beak.
    ctx.fillStyle = '#f4a259';
    ctx.beginPath();
    ctx.moveTo(34, -h - 12);
    ctx.lineTo(48, -h - 6);
    ctx.lineTo(34, -h - 2);
    ctx.closePath();
    ctx.fill();
    // Red wattle.
    ctx.fillStyle = '#d62828';
    ctx.beginPath();
    ctx.ellipse(30, -h + 4, 5, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Eye.
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(27, -h - 12, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(28, -h - 12, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // Snood.
    ctx.fillStyle = '#d62828';
    ctx.beginPath();
    ctx.ellipse(36, -h - 4, 3, 6, 0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  return { turkey, reset, jump, update, hurt, bounds, draw, height };
}
