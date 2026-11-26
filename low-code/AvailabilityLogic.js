// Appsmith-style JSObject (SIMULATED: paste into Appsmith > JS Objects > New JS Object).
// Widgets expected on the page: Input_Start, Input_Duration, Switch_Blocked, Button_Check, Text_Result, Table_Bookings.
export default {
  NOW_MIN: 480, // fixed "current time" 08:00 (Appsmith has no fixed clock; a constant keeps tests repeatable)
  MAX_DURATION: 120,
  bookings: [
    { start: 540, end: 600, title: "Study group (fictional)" },
    { start: 780, end: 870, title: "Club meeting (fictional)" }
  ],
  toMinutes(t) {
    const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec((t || "").trim());
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  },
  check() {
    const start = this.toMinutes(Input_Start.text);
    const raw = String(Input_Duration.text || "").trim();
    const blocked = Switch_Blocked.isSwitchedOn;
    let out;
    if (start === null) out = ["Unavailable", "INVALID_START", "Enter the start time as HH:MM (00:00-23:59)."];
    else if (start <= this.NOW_MIN) out = ["Unavailable", "PAST_START", "The start time must be in the future (after the current time)."];
    else if (!/^\d+$/.test(raw) || Number(raw) <= 0) out = ["Unavailable", "INVALID_DURATION", "Duration must be a whole number of minutes greater than 0."];
    else if (Number(raw) > this.MAX_DURATION) out = ["Unavailable", "DURATION_TOO_LONG", "Duration must not exceed 120 minutes."];
    else if (blocked) out = ["Unavailable", "ROOM_BLOCKED", "The room is blocked and cannot be booked."];
    else {
      const end = start + Number(raw);
      const hit = this.bookings.find(b => start < b.end && b.start < end);
      out = hit ? ["Unavailable", "OVERLAP", "The interval overlaps an existing booking."]
                : ["Available", "FREE", "The room is free for the requested interval."];
    }
    return { decision: out[0], code: out[1], message: out[2] };   // Text_Result.text = {{AvailabilityLogic.check().message}}
  }
}
