const test = require('node:test');
const assert = require('node:assert/strict');
const { checkAvailability: check } = require('./availability.js');
const data = require('./data.js');

const base = () => ({ startText: '10:30', duration: '60', blocked: false, now: data.now, bookings: data.bookings });
const run = (over) => check(Object.assign(base(), over));

test('T1: valid free interval -> Available', () => {
  const r = run({ startText: '10:30', duration: '60' });
  assert.equal(r.available, true); assert.equal(r.code, 'FREE');
});
test('T2: overlap with an existing booking -> Unavailable', () => {
  const r = run({ startText: '09:30', duration: '60' });
  assert.equal(r.available, false); assert.equal(r.code, 'OVERLAP');
});
test('T3: blocked room -> Unavailable', () => {
  const r = run({ blocked: true });
  assert.equal(r.available, false); assert.equal(r.code, 'ROOM_BLOCKED');
});
test('T4: duration = 0 -> validation error', () => {
  const r = run({ duration: '0' });
  assert.equal(r.available, false); assert.equal(r.code, 'INVALID_DURATION');
});
test('T5: duration = 121 -> validation error', () => {
  const r = run({ duration: '121' });
  assert.equal(r.available, false); assert.equal(r.code, 'DURATION_TOO_LONG');
});
test('T6: past start time -> validation error', () => {
  const r = run({ startText: '07:00' });
  assert.equal(r.available, false); assert.equal(r.code, 'PAST_START');
});
test('T7: adjacent non-overlapping interval -> Available', () => {
  assert.equal(run({ startText: '10:00', duration: '30' }).available, true); // starts when 09:00-10:00 ends
  assert.equal(run({ startText: '08:30', duration: '30' }).available, true); // ends when 09:00 booking starts
});
test('T8: booking data unchanged after checks', () => {
  const before = JSON.stringify(data.bookings);
  run({ startText: '09:30' }); run({ startText: '10:30' }); run({ blocked: true }); run({ duration: '0' });
  assert.equal(JSON.stringify(data.bookings), before);
});

// Extra edge cases (beyond the required eight)
test('E1: duration exactly 120 is allowed', () => assert.equal(run({ startText: '10:30', duration: '120' }).available, true));
test('E2: start equal to current time is not in the future', () => assert.equal(run({ startText: '08:00' }).code, 'PAST_START'));
test('E3: empty / malformed start -> INVALID_START', () => {
  for (const s of ['', '25:00', '9:5', 'abc', '10:60', null]) assert.equal(run({ startText: s }).code, 'INVALID_START', String(s));
});
test('E4: non-integer durations rejected', () => {
  for (const d of ['', '-5', '12.5', '1e3', 'abc', ' ']) assert.equal(run({ duration: d }).code, 'INVALID_DURATION', JSON.stringify(d));
});
test('E5: AC6 every rejection has a distinct, non-empty message', () => {
  const codes = ['', '07:00']; const msgs = new Set([
    run({ startText: '' }).message, run({ startText: '07:00' }).message, run({ duration: '0' }).message,
    run({ duration: '121' }).message, run({ blocked: true }).message, run({ startText: '09:30' }).message]);
  assert.equal(msgs.size, 6); msgs.forEach((m) => assert.ok(m.length > 10));
});
