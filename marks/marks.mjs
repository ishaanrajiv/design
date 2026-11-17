// Every mark, drawn on a 100×100 grid. The build renders each one four ways:
// icon-dark (Night tile), icon-light (tinted cream tile), mark-dark and mark-light (no tile, for pages).
//
// A mark gets a context `c`:
//   c.lit     the lit unit's colour (the accent, or its light shade)
//   c.ink     the other units' colour (Paper in dark, Navy in light)
//   c.dark    true for the dark appearance
//   c.ground  "night", "none" or a tile colour (light icons); used to cut gaps
//   c.t       the tokens' `marks` block (night, paper, navy, ladder…)
//   c.avia    { lit, shade, litPng, shadePng } for Avia's art layers

let uid = 0;
const id = (p) => `${p}${uid++}`;

/** Wraps a mark's units in a tile (or none). Live area is the middle ~62%. */
export function tile(inner, c, defs = "") {
  if (c.ground === "none") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="17 17 66 66">${defs ? `<defs>${defs}</defs>` : ""}${inner}</svg>`;
  }
  const g = id("g");
  const fill = c.ground === "night" ? `url(#${g})` : c.ground;
  const hair = c.ground === "night" ? "#FFFFFF" : "#000000";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.t.nightHigh}"/><stop offset="1" stop-color="${c.t.night}"/></linearGradient>${defs}</defs><rect width="100" height="100" rx="22.5" fill="${fill}"/><rect x=".5" y=".5" width="99" height="99" rx="22" fill="none" stroke="${hair}" stroke-opacity=".08"/>${inner}</svg>`;
}

/** The colour of the page or tile under the mark, for cutting gaps. */
const under = (c) => (c.ground === "night" ? c.t.night : c.ground === "none" ? (c.dark ? "#080808" : "#F2EDED") : c.ground);

/** `a` over `b` at opacity `t`, as a solid hex. */
export function mix(a, b, t) {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `#${x.map((v, i) => Math.round(v * t + y[i] * (1 - t)).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

const ring = (cx, cy, r1, r2) =>
  `M${cx - r1} ${cy}A${r1} ${r1} 0 1 0 ${cx + r1} ${cy}A${r1} ${r1} 0 1 0 ${cx - r1} ${cy}ZM${cx - r2} ${cy}A${r2} ${r2} 0 1 0 ${cx + r2} ${cy}A${r2} ${r2} 0 1 0 ${cx - r2} ${cy}Z`;
const arc = (r, s, e) => {
  const p = (d) => [50 + r * Math.cos((d * Math.PI) / 180), 50 + r * Math.sin((d * Math.PI) / 180)].map((v) => v.toFixed(2)).join(" ");
  return `M${p(s)}A${r} ${r} 0 0 1 ${p(e)}`;
};

/** A closed polygon, its points clockwise on screen, with every corner rounded to radius `r`. */
export const roundPoly = (pts, r) => {
  const f = (v) => +v.toFixed(2);
  const n = pts.length;
  return `${pts
    .map((p, i) => {
      const toward = (q) => {
        const [dx, dy] = [q[0] - p[0], q[1] - p[1]];
        const len = Math.hypot(dx, dy);
        return [dx / len, dy / len];
      };
      const [a, b] = [toward(pts[(i + n - 1) % n]), toward(pts[(i + 1) % n])];
      const d = r / Math.tan(Math.acos(a[0] * b[0] + a[1] * b[1]) / 2); // corner to where the arc starts
      return `${i ? "L" : "M"}${f(p[0] + a[0] * d)} ${f(p[1] + a[1] * d)}A${r} ${r} 0 0 1 ${f(p[0] + b[0] * d)} ${f(p[1] + b[1] * d)}`;
    })
    .join("")}Z`;
};

// The dish, drawn on a 1024 grid.
const DISH = {
  dish: "M177.15,512 A334.85,334.85 0 1 0 846.85,512 A334.85,334.85 0 1 0 177.15,512 Z M222.21,512 A289.79,289.79 0 1 0 801.79,512 A289.79,289.79 0 1 0 222.21,512 Z",
  lit: "M435.20,328.01 A36.86,36.86 0 0 1 478.92,356.40 L489.14,404.48 A36.86,36.86 0 0 1 460.75,448.20 L412.67,458.42 A36.86,36.86 0 0 1 368.95,430.03 L358.73,381.95 A36.86,36.86 0 0 1 387.12,338.23 Z M612.47,321.46 A36.86,36.86 0 0 1 643.85,363.09 L637.01,411.77 A36.86,36.86 0 0 1 595.37,443.14 L546.70,436.30 A36.86,36.86 0 0 1 515.32,394.67 L522.16,345.99 A36.86,36.86 0 0 1 563.80,314.62 Z M527.50,475.46 A36.86,36.86 0 0 1 561.01,515.40 L556.73,564.37 A36.86,36.86 0 0 1 516.79,597.88 L467.83,593.59 A36.86,36.86 0 0 1 434.32,553.66 L438.60,504.69 A36.86,36.86 0 0 1 478.54,471.18 Z",
  active: "M665.00,478.46 A36.86,36.86 0 0 1 706.64,509.83 L713.48,558.51 A36.86,36.86 0 0 1 682.10,600.14 L633.43,606.98 A36.86,36.86 0 0 1 591.79,575.61 L584.95,526.93 A36.86,36.86 0 0 1 616.33,485.30 Z",
  off: "M440.12,597.59 A36.86,36.86 0 0 1 466.97,642.28 L455.08,689.97 A36.86,36.86 0 0 1 410.39,716.82 L362.70,704.93 A36.86,36.86 0 0 1 335.85,660.25 L347.74,612.55 A36.86,36.86 0 0 1 392.43,585.70 Z M586.42,612.49 A36.86,36.86 0 0 1 626.36,646.00 L630.64,694.97 A36.86,36.86 0 0 1 597.13,734.90 L548.17,739.19 A36.86,36.86 0 0 1 508.23,705.68 L503.95,656.71 A36.86,36.86 0 0 1 537.46,616.78 Z",
};

// Tern: the t's stem with its hooked foot, its crossbar, and the cursor, on a 1024 grid.
export const TERN = {
  stem: "M334 276A48 48 0 0 1 430 276L430 628Q430 684 486 684L522 684A48 48 0 0 1 522 780L486 780Q334 780 334 628Z",
  crossbar: "M282 360L502 360A48 48 0 0 1 502 456L282 456A48 48 0 0 1 282 360Z",
  cursor: "M630 700L766 700A24 24 0 0 1 790 724L790 756A24 24 0 0 1 766 780L630 780A24 24 0 0 1 606 756L606 724A24 24 0 0 1 630 700Z",
};

// Lyrate: one page of the Riffle, pivoting at the origin.
const PAGE = "M-1 0C-4-20-4.5-38-3-50A3 3 0 0 1 3-50C4.5-38 4-20 1 0Z";

export const MARKS = {
  homelab: (c) =>
    tile(
      `<g transform="scale(.09765625)"><path d="${DISH.dish}" fill="${c.ink}" fill-rule="evenodd"/><path d="${DISH.lit}" fill="${c.ink}" opacity="${c.dark ? 1 : 0.6}"/><path d="${DISH.active}" fill="${c.lit}"/><path d="${DISH.off}" fill="${c.dark ? "#3A352D" : mix(c.ink, under(c), 0.2)}"/></g>`,
      c,
    ),

  otto: (c) =>
    tile(
      `<path d="M2.5 12.5A9.5 9.5 0 1 0 21.5 12.5A9.5 9.5 0 1 0 2.5 12.5ZM12 10.6L12 12.2A1.3 1.3 0 0 0 14.6 12.2L14.6 10.6A1.3 1.3 0 0 0 12 10.6ZM16.7 10.6L16.7 12.2A1.3 1.3 0 0 0 19.3 12.2L19.3 10.6A1.3 1.3 0 0 0 16.7 10.6Z" transform="translate(50 50) scale(2.75) translate(-12 -12.5)" fill="${c.ink}" fill-rule="evenodd"/>`,
      c,
    ),

  lyrate: (c) =>
    tile(
      // The one exception to "one lit": every page at full strength, fading from the
      // ink front page to the accent back page (decisions.md, sea glass).
      `<g transform="translate(25.75 74.25)">${[90, 75, 60, 45, 30, 15, 0]
        .map((a, i) => `<path d="${PAGE}" transform="rotate(${a})" fill="${mix(c.ink, c.lit, i / 6)}"/>`)
        .join("")}</g>`,
      c,
    ),

  paperside: (c) =>
    tile(
      `<rect x="48.5" y="19" width="24.5" height="20" rx="1.6" fill="${c.lit}"/><rect x="27" y="19" width="18" height="20" rx="1.6" fill="${c.ink}" opacity="${c.t.ladder[1]}"/><rect x="27" y="42.5" width="46" height="17.5" rx="1.6" fill="${c.ink}" opacity="${c.t.ladder[2]}"/><rect x="27" y="63.5" width="46" height="17.5" rx="1.6" fill="${c.ink}" opacity="${c.t.ladder[3]}"/>`,
      c,
    ),

  // Avia keeps its own art: two PNG layers used as masks, recoloured. The lit layer is the whole
  // tent and the shade layer its right face, so the shade is painted over the lit.
  avia: (c) => {
    const [m1, m2] = [id("m"), id("m")];
    return tile(
      `<rect width="100" height="100" fill="${c.avia.lit}" mask="url(#${m1})"/><rect width="100" height="100" fill="${c.avia.shade}" mask="url(#${m2})"/>`,
      c,
      `<mask id="${m1}"><image href="${c.avia.litPng}" width="100" height="100"/></mask><mask id="${m2}"><image href="${c.avia.shadePng}" width="100" height="100"/></mask>`,
    );
  },

  // Hocin's Throw: a projector's beam landing on a slim lit screen. The beam narrows to the lens at
  // the right, so it is also Play. Three even bands (13 wide, 4 apart, as is the gap to the
  // screen) run at full strength from an ink tip to the screen's accent: the second exception
  // to "one lit", after Lyrate (decisions.md, 2026-11-16).
  hocin: (c) => {
    const [x0, x1, H] = [32.5, 79.5, 27]; // the beam is 2H tall at x0 and closes at x1
    const h = (x) => (H * (x1 - x)) / (x1 - x0);
    const band = (a, b) => (b < x1 ? [[a, 50 - h(a)], [b, 50 - h(b)], [b, 50 + h(b)], [a, 50 + h(a)]] : [[a, 50 - h(a)], [b, 50], [a, 50 + h(a)]]);
    return tile(
      `<rect x="20.5" y="21" width="8" height="58" rx="4" fill="${c.lit}"/>${[[32.5, 45.5, 0.62], [49.5, 62.5, 0.3], [66.5, 79.5, 0]]
        .map(([a, b, t]) => `<path d="${roundPoly(band(a, b), 1.6)}" fill="${mix(c.lit, c.ink, t)}"/>`)
        .join("")}`,
      c,
    );
  },

  library: (c) =>
    tile(
      `<rect x="21" y="75" width="58" height="6" rx="3" fill="${c.ink}" opacity="${c.t.ladder[3]}"/><rect x="24" y="33" width="10" height="39" rx="3" fill="${c.ink}"/><rect x="37" y="26" width="10" height="46" rx="3" fill="${c.ink}" opacity="${c.t.ladder[2]}"/><rect x="50" y="37" width="9" height="35" rx="3" fill="${c.ink}" opacity="${c.t.ladder[3]}"/><rect x="61" y="27" width="9" height="45" rx="3" fill="${c.lit}" transform="rotate(13 61 72)"/>`,
      c,
    ),

  primer: (c) =>
    tile(
      `${[[29, 44, 0.6], [39, 50, 0.6], [59, 46, 0.6], [69, 30, 0.32]].map(([y, w, o]) => `<rect x="25" y="${y}" width="${w}" height="5.5" rx="2.75" fill="${c.ink}" opacity="${o}"/>`).join("")}<rect x="22" y="46" width="56" height="9" rx="4.5" fill="${c.lit}"/>`,
      c,
    ),

  // Undercut's tyre, in real proportion (wheel ≈ 0.57 of the tyre), no spokes, dark rubber in dark mode.
  undercut: (c) => {
    const [tyre, rim] = c.dark ? [0.24, 0.9] : [0.9, 0.6];
    return tile(
      `<path d="${ring(50, 50, 31, 18.6)}" fill="${c.ink}" fill-rule="evenodd" opacity="${tyre}"/><path d="${arc(26.6, 125, 235)}" fill="none" stroke="${c.lit}" stroke-width="3.6" stroke-linecap="round"/><path d="${arc(26.6, -55, 55)}" fill="none" stroke="${c.lit}" stroke-width="3.6" stroke-linecap="round"/><path d="${ring(50, 50, 16.8, 13.8)}" fill="${c.ink}" fill-rule="evenodd" opacity="${rim}"/><circle cx="50" cy="50" r="5" fill="${c.ink}" opacity="${rim * 0.6}"/>`,
      c,
    );
  },

  // An open book seen from the front, its pages and cover dipping to the spine, with a bookmark
  // ribbon in Lyrate's sea glass (both are for reading).
  books: (c) => {
    const half = (k, inner) => `<g transform="translate(50 0) skewY(${k}) translate(-50 0)">${inner}</g>`;
    return tile(
      half(10, `<rect x="19" y="72" width="31" height="5" rx="2.5" fill="${c.ink}" opacity="${c.t.ladder[3]}"/>`) +
        half(-10, `<rect x="50" y="72" width="31" height="5" rx="2.5" fill="${c.ink}" opacity="${c.t.ladder[3]}"/>`) +
        half(10, `<rect x="21" y="27" width="26.5" height="42" rx="3.2" fill="${c.ink}" opacity="${c.t.ladder[1]}"/>`) +
        half(-10, `<rect x="52.5" y="27" width="26.5" height="42" rx="3.2" fill="${c.ink}" opacity="${c.t.ladder[2]}"/>`) +
        half(-10, `<path d="M58 23H65V47L61.5 43.5L58 47Z" fill="${c.lit}" stroke="${c.lit}" stroke-width="3" stroke-linejoin="round"/>`),
      c,
    );
  },

  // The site: the initials "ir". The i's stem, an r drawn as one hooked stroke, and the i's dot
  // lit. Made of letters, because the site is a person (decisions.md, 2026-11-17).
  site: (c) =>
    tile(
      `<circle cx="29.75" cy="28" r="8" fill="${c.lit}"/><rect x="23" y="41" width="13.5" height="39" rx="6.75" fill="${c.ink}"/><path d="M49.75 73.25V61.75a14 14 0 0 1 14-14h6" fill="none" stroke="${c.ink}" stroke-width="13.5" stroke-linecap="round" opacity="${c.t.ladder[2]}"/>`,
      c,
    ),

  // Tern: a lowercase t and a cursor, the app's own icon kept and drawn on a 1024 grid (its Tern.icon
  // layers use the same paths). The crossbar sits under the stem a step down the ladder; the cursor
  // is lit. The second mark made of a letter, after the site (decisions.md, 2026-11-17).
  tern: (c) =>
    tile(
      `<g transform="scale(.09765625)"><path d="${TERN.crossbar}" fill="${c.ink}" opacity="${c.t.ladder[1]}"/><path d="${TERN.stem}" fill="${c.ink}"/><path d="${TERN.cursor}" fill="${c.lit}"/></g>`,
      c,
    ),

  // Proser: two voices. A pair of opening quotation marks, each a round with its tail, for a
  // story written by two hands: mine in ink, the agent's lit (decisions.md, 2026-11-17).
  proser: (c) => {
    const quote = (cx, fill) =>
      `<circle cx="${cx}" cy="62.5" r="11.5" fill="${fill}"/><path d="M${cx - 10} 62.5C${cx - 11} 47.5 ${cx - 4} 36.5 ${cx + 8} 30.5" fill="none" stroke="${fill}" stroke-width="8.5" stroke-linecap="round"/>`;
    return tile(quote(36, c.ink) + quote(66, c.lit), c);
  },
};
