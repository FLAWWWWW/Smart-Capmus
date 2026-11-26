// Pure booking rules. No DOM, no I/O. Times are minutes from 00:00.
(function (root) {
  'use strict';

  const MAX_DURATION = 120;

  const REASONS = {
    FREE: 'The room is free for the requested interval.',
    INVALID_START: 'Enter the start time as HH:MM (00:00-23:59).',
    PAST_START: 'The start time must be in the future (after the current time).',
    INVALID_DURATION: 'Duration must be a whole number of minutes greater than 0.',
    DURATION_TOO_LONG: 'Duration must not exceed ' + MAX_DURATION + ' minutes.',
    ROOM_BLOCKED: 'The room is blocked and cannot be booked.',
    OVERLAP: 'The interval overlaps an existing booking.'
  };

  function parseTime(text) {
    if (typeof text !== 'string') return null;
    const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(text.trim());
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  }

  function formatTime(min) {
    const h = String(Math.floor(min / 60)).padStart(2, '0');
    const m = String(min % 60).padStart(2, '0');
    return h + ':' + m;
  }

  function parseDuration(value) {
    const text = String(value == null ? '' : value).trim();
    if (!/^\d+$/.test(text)) return null; // rejects "", "-5", "1e3", "12.5", "abc"
    return Number(text);
  }

  function result(available, code, extra) {
    return Object.assign({ available: available, code: code, message: REASONS[code] }, extra || {});
  }

  // Reads bookings, never writes them (AC5).
  function checkAvailability(req) {
    const start = parseTime(req.startText);
    if (start === null) return result(false, 'INVALID_START');
    if (start <= req.now) return result(false, 'PAST_START');                         // AC1

    const duration = parseDuration(req.duration);
    if (duration === null || duration <= 0) return result(false, 'INVALID_DURATION'); // AC2
    if (duration > MAX_DURATION) return result(false, 'DURATION_TOO_LONG');          // AC2

    if (req.blocked) return result(false, 'ROOM_BLOCKED');                            // AC4

    const end = start + duration;
    for (const b of req.bookings) {                                                   // AC3
      if (start < b.end && b.start < end) return result(false, 'OVERLAP', { conflict: b });
    }
    return result(true, 'FREE');
  }

  const api = { checkAvailability, parseTime, formatTime, parseDuration, REASONS, MAX_DURATION };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Availability = api;
})(typeof window !== 'undefined' ? window : globalThis);
