/* The shell-only build (req 3344 step 0; Godric's yes, 9 November 2026): the floors whose dressing (fixtures, fittings,
   furniture, portraits, finishes laid by the page) is held off while their shell faults are cleared. Nothing is deleted:
   W5B_THINGS, the shell-things files and every placement stay as they are; the page only skips building them.
   page/shell.html reads this list. ?bare=1 holds any place bare, ?bare=0 dresses it whatever the list says.
   floors: the model's level ids ('B', 'G', '1' to '7') held bare in the live page. Empty until Fawkes says whether
   "off in the build" means the live page or the gate and review builds only (asked 9 November 2026).
   clean: floors whose shell count is zero in the gate (step 1); a floor moves from open to clean, then its dressing
   goes back on and is re-placed against the new walls. */
window.SHELL_BARE = {
  floors: [],
  clean: []
};
