/* The shell-only build (req 3344 step 0; Godric's yes, 9 November 2026): the floors whose dressing (fixtures, fittings,
   furniture, portraits, finishes laid by the page) is held off while their shell faults are cleared. Nothing is deleted:
   W5B_THINGS, the shell-things files and every placement stay as they are; the page only skips building them.
   page/shell.html reads this list. ?bare=1 holds any place bare, ?bare=0 dresses it whatever the list says.
   floors: the model's level ids held bare in the live page. Godric, 9 November 2026, 6.02 pm (req 3355): "Dressing off
   is universal", so every level id the model uses is here, the towers' too.
   clean: floors whose shell count is zero in the gate (tools/shell-gate.py); a floor moves from floors to clean only when
   its count is zero and Fawkes says so, then its dressing goes back on and is re-placed against the new walls. */
window.SHELL_BARE = {
  all: true,   /* every place, a mass's slug (entrance-hall, stair-hall) as well as a room; &clean tool loads excepted (shell.html) */
  floors: ['B', 'G', '1', '2', '3', '4', '5', '6', '7', 'T', 'tower', 'tower-1', 'tower-2', 'tower-3', 'tower-4', 'tower-5', 'tower-6'],
  clean: []
};
