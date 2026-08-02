/**
 * Brand title growth animation, shared across all Leinster Media pages.
 * Characters are hidden (0 width) until revealed, growing outward from
 * anchor letters visible from the start — so the growth reads as a snap.
 *
 * Target string: "Leinster Media"
 * Anchors: L (0), M (9) — the initials, visible at start and read as "LM".
 * Everything else grows outward from those two letters.
 */
function growBrandTitle(titleEl, onDone) {
  const FULL = 'Leinster Media';
  const ANCHOR_INDICES = [0, 9]; // L, M
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  titleEl.textContent = '';
  titleEl.setAttribute('aria-label', FULL);

  if (reduceMotion) {
    titleEl.textContent = FULL;
    onDone();
    return;
  }

  const spans = FULL.split('').map((ch, i) => {
    const span = document.createElement('span');
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    const isAnchor = ANCHOR_INDICES.includes(i);
    span.style.display = 'inline-block';
    span.style.maxWidth = isAnchor ? '1ch' : '0ch';
    span.style.opacity = isAnchor ? '1' : '0';
    span.style.overflow = 'hidden';
    span.style.transition = 'max-width 200ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms ease';
    titleEl.appendChild(span);
    return { span, index: i, isAnchor };
  });

  const groups = new Map();
  spans.forEach(({ index, isAnchor }) => {
    if (isAnchor) return;
    const dist = Math.min(...ANCHOR_INDICES.map((a) => Math.abs(index - a)));
    if (!groups.has(dist)) groups.set(dist, []);
    groups.get(dist).push(index);
  });
  const orderedGroups = [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([, idxs]) => idxs);
  const byIndex = new Map(spans.map((s) => [s.index, s.span]));

  const holdOnPGCS = 1400; // clear pause reading "LM" before anything moves
  const stagger = 20; // fast, tight succession once it starts — reads as a snap

  setTimeout(() => {
    orderedGroups.forEach((idxs, i) => {
      setTimeout(() => {
        idxs.forEach((idx) => {
          const span = byIndex.get(idx);
          span.style.maxWidth = '1ch';
          span.style.opacity = '1';
        });
      }, i * stagger);
    });
  }, holdOnPGCS);

  const totalDelay = holdOnPGCS + orderedGroups.length * stagger + 260;
  setTimeout(onDone, totalDelay);
}
