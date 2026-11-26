// Fictional data only. One room, fixed "current time" (08:00).
(function (root) {
  const data = {
    room: 'Athena 101 (fictional)',
    now: 8 * 60, // 08:00
    bookings: [
      { start: 9 * 60, end: 10 * 60, title: 'Study group (fictional)' },
      { start: 13 * 60, end: 14 * 60 + 30, title: 'Club meeting (fictional)' }
    ]
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
  else root.CampusData = data;
})(typeof window !== 'undefined' ? window : globalThis);
