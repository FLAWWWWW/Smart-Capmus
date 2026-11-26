// SIMULATION harness: runs the JSObject above with mocked Appsmith widget globals.
// It tests the LOGIC only. It does NOT test Appsmith itself (widgets, deployment, permissions).
const fs = require('fs');
let src = fs.readFileSync(__dirname + '/AvailabilityLogic.js', 'utf8').replace('export default', 'module.exports =');
const m = { exports: {} }; new Function('module', 'Input_Start', 'Input_Duration', 'Switch_Blocked', src)(m, null, null, null);
const W = { Input_Start: { text: '' }, Input_Duration: { text: '' }, Switch_Blocked: { isSwitchedOn: false } };
function run(start, dur, blocked) {
  const logic = new Function('Input_Start', 'Input_Duration', 'Switch_Blocked', 'module',
    src + '; return module.exports;')(W.Input_Start, W.Input_Duration, W.Switch_Blocked, { exports: {} });
  W.Input_Start.text = start; W.Input_Duration.text = dur; W.Switch_Blocked.isSwitchedOn = !!blocked;
  const ctx = logic; return ctx.check.call(ctx);
}
const before = JSON.stringify(new Function('Input_Start','Input_Duration','Switch_Blocked','module', src+'; return module.exports;')({},{},{},{exports:{}}).bookings);
const cases = [
  ['T1', '10:30', '60', false, 'Available'], ['T2', '09:30', '60', false, 'Unavailable'],
  ['T3', '10:30', '60', true, 'Unavailable'], ['T4', '10:30', '0', false, 'Unavailable'],
  ['T5', '10:30', '121', false, 'Unavailable'], ['T6', '07:00', '60', false, 'Unavailable'],
  ['T7', '10:00', '30', false, 'Available']
];
let pass = 0;
for (const [id, s, d, b, exp] of cases) {
  const r = run(s, d, b); const ok = r.decision === exp; if (ok) pass++;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${id} start=${s} dur=${d} blocked=${b} -> ${r.decision} [${r.code}]`);
}
const after = JSON.stringify(new Function('Input_Start','Input_Duration','Switch_Blocked','module', src+'; return module.exports;')({},{},{},{exports:{}}).bookings);
const t8 = before === after; if (t8) pass++;
console.log(`${t8 ? 'PASS' : 'FAIL'} T8 bookings unchanged (JSObject constant data)`);
console.log(`\n${pass} / 8 passed (simulated JSObject logic, mocked widgets)`);
