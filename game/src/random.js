// Seeded random numbers (mulberry32) so a screenshot run replays the
// exact same farm: same obstacles, same corn, same farmer behaviour.
export function createSeededRandom(seed) {
  let state = seed >>> 0;
  return function nextRandom() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pickFrom(random, list) {
  return list[Math.floor(random() * list.length)];
}

export function rangeRandom(random, min, max) {
  return min + random() * (max - min);
}
