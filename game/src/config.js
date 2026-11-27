// Gobble Dash — Turkey Escape: tuning constants and zone definitions.
// One place for every number the game balances on, so the difficulty curve
// (farmyard -> cornfield -> kitchen) can be read at a glance.
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const GROUND_Y = 620;

export const TURKEY_X = 300;
export const GOAL_DISTANCE_M = 1000;
export const START_LIVES = 3;
export const START_FARMER_GAP = 260; // pixels between turkey and farmer
export const FARMER_CATCH_GAP = 0;
export const FARMER_MAX_GAP = 420;

export const GRAVITY = 0.55;
export const JUMP_VELOCITY = -14.5;
export const FLAP_VELOCITY = -11;
export const MAX_FALL_SPEED = 18;
export const DUCK_HEIGHT_SCALE = 0.55;

export const BASE_SPEED = 6.2; // world scroll px per frame at 60fps
export const SPEED_PER_ZONE = 0.9; // extra speed each zone deeper in

// A hit costs a life and lets the farmer close in; clean running and corn
// push him back. Hiding in a haystack loses him badly.
export const GAP_LOSS_ON_HIT = 70;
export const GAP_GAIN_PER_CORN = 6;
export const GAP_GAIN_PER_FEATHER = 18;
export const GAP_GAIN_HIDE = 90;
export const GAP_RECOVERY_PER_SECOND = 4;

export const SCORE_PER_METRE = 1;
export const SCORE_PER_CORN = 10;
export const SCORE_PER_FEATHER = 50;

// Zones of the escape: the turkey runs out of the farmyard, through the
// cornfield, and finally across the farmhouse kitchen floor.
export const ZONES = [
  { name: 'FARMYARD', from: 0, to: 300, skyTop: '#f7b267', skyBottom: '#f4845f', ground: '#8a5a2b', accent: '#e07a3f' },
  { name: 'CORNFIELD', from: 300, to: 650, skyTop: '#f9c74f', skyBottom: '#f3722c', ground: '#6b8e23', accent: '#ffd60a' },
  { name: 'KITCHEN', from: 650, to: 1000, skyTop: '#e85d4a', skyBottom: '#7b2d26', ground: '#5d4037', accent: '#ffb703' },
];

export function zoneFor(distanceM) {
  for (const zone of ZONES) {
    if (distanceM < zone.to) return zone;
  }
  return ZONES[ZONES.length - 1];
}

export function zoneIndexFor(distanceM) {
  for (let i = 0; i < ZONES.length; i++) {
    if (distanceM < ZONES[i].to) return i;
  }
  return ZONES.length - 1;
}
