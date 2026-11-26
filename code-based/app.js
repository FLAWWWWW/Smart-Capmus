// Presentation layer only. All output is written with textContent (no innerHTML).
(function () {
  const A = window.Availability, D = window.CampusData;
  const $ = (id) => document.getElementById(id);

  $('room').textContent = D.room;
  $('now').textContent = A.formatTime(D.now);
  D.bookings.forEach(function (b) {
    const li = document.createElement('li');
    li.textContent = A.formatTime(b.start) + '-' + A.formatTime(b.end) + ' ' + b.title;
    $('bookings').appendChild(li);
  });

  $('check').addEventListener('click', function () {
    const r = A.checkAvailability({
      startText: $('start').value,
      duration: $('duration').value,
      blocked: $('blocked').checked,
      now: D.now,
      bookings: D.bookings
    });
    const box = $('result');
    box.hidden = false;
    box.className = r.available ? 'ok' : 'bad';
    box.textContent = (r.available ? 'Available' : 'Unavailable') + ' [' + r.code + ']: ' + r.message;
  });
})();
