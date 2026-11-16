// The figures in the README and the guide, drawn from the tokens so they can't drift.
// Each one carries its own grounds, so it reads on GitHub's light and dark themes alike.
// Called by build.mjs; writes nothing itself.

const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const W = 880;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const doc = (h, body, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" font-family="${SANS}">${defs ? `<defs>${defs}</defs>` : ""}${body}</svg>`;
const text = (x, y, s, o = {}) =>
  `<text x="${x}" y="${y}" font-size="${o.size ?? 13}" font-weight="${o.weight ?? 400}" fill="${o.fill}"${o.anchor ? ` text-anchor="${o.anchor}"` : ""}${o.family ? ` font-family="${o.family}"` : ""}${o.ls ? ` letter-spacing="${o.ls}"` : ""}>${esc(s)}</text>`;
const rect = (x, y, w, h, r, fill, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${extra}/>`;
/** A rendered mark or icon (a full <svg>), placed at x, y and sized s. */
const place = (svg, x, y, s) => svg.replace("<svg ", `<svg x="${x}" y="${y}" width="${s}" height="${s}" `);

const hue = (h) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const mx = Math.max(r, g, b);
  const d = mx - Math.min(r, g, b);
  if (!d) return 0;
  const x = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return x * 60;
};

export function figures({ T, products, rendered, contrast, font }) {
  const M = T.marks;
  const modes = {
    dark: { g: T.grounds.dark, t: T.text.dark, lit: T.lit.dark, ink: M.paper, label: "Dark" },
    light: { g: T.grounds.light, t: T.text.light, lit: T.lit.light, ink: M.navy, label: "Light" },
  };
  const state = (k, mode) => T.states[k][mode];
  const on = (bg) => (contrast("#000000", bg) > contrast("#FFFFFF", bg) ? "#0C0E15" : "#FFFFFF");
  const out = {};

  // --- Every mark, grouped by tier, as the dark and light icons.
  {
    const groups = [
      ["Market apps", Object.keys(products).filter((k) => products[k].tier === "market")],
      ["Site", Object.keys(products).filter((k) => products[k].tier === "site")],
      ["Lab tools", Object.keys(products).filter((k) => products[k].tier === "lab")],
    ];
    const [gap, groupGap, pad] = [12, 34, 32];
    const n = groups.reduce((a, [, ks]) => a + ks.length, 0);
    // Icons shrink as products are added, so the row always fits with a margin each side.
    const fixed = groups.reduce((a, [, ks]) => a + (ks.length - 1) * gap, 0) + groupGap * (groups.length - 1);
    const s = Math.min(58, Math.floor((W - 2 * 40 - fixed) / n));
    const width = n * s + fixed;
    const x0 = (W - width) / 2;
    const row = (mode, y) => {
      const m = modes[mode];
      let x = x0;
      let body = "";
      for (const [title, ks] of groups) {
        body += text(x, y + 26, title.toUpperCase(), { size: 10, weight: 600, fill: m.t.secondary, ls: "0.08em" });
        for (const k of ks) {
          body += place(rendered[k][`icon-${mode}`], x, y + 40, s);
          body += text(x + s / 2, y + 40 + s + 18, products[k].name, { size: 11, fill: m.t.secondary, anchor: "middle" });
          x += s + gap;
        }
        x += groupGap - gap;
      }
      return body;
    };
    const h = 40 + s + 18 + pad;
    out.marks = doc(
      h * 2,
      rect(0, 0, W, h * 2, 20, modes.light.g.ground) +
        `<path d="M0 20A20 20 0 0 1 20 0H${W - 20}A20 20 0 0 1 ${W} 20V${h}H0Z" fill="${modes.dark.g.ground}"/>` +
        row("dark", 4) +
        row("light", h + 4),
    );
  }

  // --- Grounds: the four layers of each appearance, nested as they are used.
  {
    const pane = (mode, x) => {
      const { g, t, label } = modes[mode];
      const pw = 428;
      const tag = (x2, y, name, hex) =>
        text(x2, y, name, { size: 13, weight: 600, fill: t.primary }) + text(x2, y + 17, hex, { size: 11, fill: t.secondary, family: MONO });
      return (
        rect(x, 0, pw, 312, 20, g.ground, ` stroke="${g.line}"`) +
        text(x + 24, 34, label.toUpperCase(), { size: 10, weight: 600, fill: t.secondary, ls: "0.08em" }) +
        rect(x + 24, 52, pw - 48, 196, 14, g.surface) +
        tag(x + 42, 80, "Surface", g.surface) +
        `<line x1="${x + 42}" x2="${x + pw - 42}" y1="${112}" y2="${112}" stroke="${g.line}" stroke-width="1.5"/>` +
        text(x + pw - 42, 106, `Line ${g.line}`, { size: 11, fill: t.secondary, family: MONO, anchor: "end" }) +
        rect(x + 42, 130, pw - 84, 100, 12, g.raised) +
        tag(x + 60, 160, "Raised", g.raised) +
        text(x + 60, 210, "Cards on a surface, pressed rows, inputs", { size: 12, fill: t.secondary }) +
        tag(x + 24, 270, "Ground", g.ground) +
        text(x + pw - 24, 270, "Ours on sheets and lists too", { size: 12, fill: t.secondary, anchor: "end" })
      );
    };
    out.grounds = doc(312, pane("dark", 0) + pane("light", 452));
  }

  // --- Roles: one screen in each appearance, every colour doing its one job.
  {
    const accent = products.lyrate.shades;
    const pane = (mode, x) => {
      const { g, t, lit } = modes[mode];
      const tint = mode === "dark" ? accent.dark : accent.lightText;
      const pw = 428;
      const role = (y, s) => text(x + pw - 20, y, s, { size: 10, fill: t.secondary, family: MONO, anchor: "end" });
      const cx = x + 24;
      const toggle = (tx, ty, isOn) =>
        rect(tx, ty, 44, 26, 13, isOn ? tint : g.line) + `<circle cx="${isOn ? tx + 31 : tx + 13}" cy="${ty + 13}" r="11" fill="#FFFFFF"/>`;
      return (
        rect(x, 0, pw, 470, 20, g.ground, ` stroke="${g.line}"`) +
        text(cx, 52, "Reading", { size: 28, weight: 700, fill: t.primary }) +
        text(cx, 76, "Three books in progress", { size: 14, fill: t.secondary }) +
        role(52, "text: system") +
        // Lit: the selected pill.
        rect(cx, 98, 128, 32, 16, lit.fill) +
        text(cx + 64, 119, "On this iPhone", { size: 13, weight: 600, fill: lit.on, anchor: "middle" }) +
        rect(cx + 136, 98, 84, 32, 16, g.raised) +
        text(cx + 178, 119, "Server", { size: 13, weight: 500, fill: t.secondary, anchor: "middle" }) +
        role(119, "lit · raised") +
        // A grouped list on Surface, with a Line between rows and a tinted toggle and progress.
        rect(cx, 148, 262, 152, 14, g.surface) +
        text(cx + 16, 176, "The Odyssey", { size: 15, weight: 500, fill: t.primary }) +
        text(cx + 16, 196, "Homer", { size: 13, fill: t.secondary }) +
        rect(cx + 16, 208, 230, 4, 2, g.line) +
        rect(cx + 16, 208, 148, 4, 2, tint) +
        `<line x1="${cx + 16}" x2="${cx + 262}" y1="226" y2="226" stroke="${g.line}" stroke-width="1.5"/>` +
        text(cx + 16, 254, "Middlemarch", { size: 15, weight: 500, fill: t.primary }) +
        text(cx + 16, 274, "George Eliot", { size: 13, fill: t.secondary }) +
        toggle(cx + 202, 245, true) +
        role(180, "surface") +
        role(213, "tint: progress") +
        role(230, "line") +
        role(262, "tint: toggle") +
        // A link in the tint.
        text(cx, 330, "See all books", { size: 15, weight: 500, fill: tint }) +
        role(330, "tint: link") +
        // States: shared, never an accent.
        `<circle cx="${cx + 5}" cy="${361}" r="5" fill="${state("fine", mode)}"/>` +
        text(cx + 18, 366, "Synced", { size: 13, fill: t.secondary }) +
        `<circle cx="${cx + 91}" cy="${361}" r="5" fill="${state("critical", mode)}"/>` +
        text(cx + 104, 366, "Couldn't reach the server", { size: 13, fill: state("errorText", mode) }) +
        role(366, "states") +
        // The primary button is lit too.
        rect(cx, 392, 262, 48, 24, lit.fill) +
        text(cx + 131, 422, "Continue reading", { size: 16, weight: 600, fill: lit.on, anchor: "middle" }) +
        role(422, "lit: primary")
      );
    };
    out.roles = doc(470, pane("dark", 0) + pane("light", 452));
  }

  // --- Accents: where each sits on the wheel, and the shades the build derives from it.
  {
    const list = Object.entries(products).filter(([, p]) => p.shades);
    const rowH = 34;
    const h = 64 + list.length * rowH + 24;
    const dark = modes.dark;
    const ww = 300;
    const [cx, cy] = [ww / 2, 34 + (h - 34) / 2];
    const R = 116;
    let wheel = "";
    for (let a = 0; a < 360; a += 5) {
      const p = (d, r) => [cx + r * Math.cos(((d - 90) * Math.PI) / 180), cy + r * Math.sin(((d - 90) * Math.PI) / 180)].map((v) => v.toFixed(2)).join(" ");
      wheel += `<path d="M${p(a, R + 8)}A${R + 8} ${R + 8} 0 0 1 ${p(a + 5.4, R + 8)}L${p(a + 5.4, R + 2)}A${R + 2} ${R + 2} 0 0 0 ${p(a, R + 2)}Z" fill="hsl(${a} 55% 68%)" opacity=".35"/>`;
    }
    const dot = (p, r, size) => {
      const a = ((hue(p.accent) - 90) * Math.PI) / 180;
      return `<circle cx="${(cx + r * Math.cos(a)).toFixed(2)}" cy="${(cy + r * Math.sin(a)).toFixed(2)}" r="${size}" fill="${p.accent}" stroke="${dark.g.ground}" stroke-width="2.5"/>`;
    };
    wheel += `<circle cx="${cx}" cy="${cy}" r="${R - 30}" fill="none" stroke="${dark.g.line}" stroke-dasharray="2 4"/>`;
    for (const [, p] of list) if (p.tier === "lab") wheel += dot(p, R - 30, 8);
    for (const [, p] of list) if (p.tier !== "lab") wheel += dot(p, R - 4, 11);
    const left =
      rect(0, 0, ww, h, 20, dark.g.ground) +
      text(24, 34, "HUE", { size: 10, weight: 600, fill: dark.t.secondary, ls: "0.08em" }) +
      wheel +
      text(cx, cy - 6, "Outer: market apps", { size: 11, fill: dark.t.secondary, anchor: "middle" }) +
      text(cx, cy + 10, "and the site, kept apart", { size: 11, fill: dark.t.secondary, anchor: "middle" }) +
      text(cx, cy + 30, "Inner: lab tools", { size: 11, fill: dark.t.tertiary, anchor: "middle" });

    const x0 = ww + 16;
    const cols = [
      ["Dark", (p) => [p.shades.dark, dark.g.ground]],
      ["Light graphic", (p) => [p.shades.lightGraphic, T.grounds.light.ground]],
      ["Light tint", (p) => [p.shades.lightText, T.grounds.light.ground]],
      ["Light tile", (p) => [p.shades.lightTile, null]],
    ];
    const chipW = 88;
    const c0 = x0 + 150;
    let right = rect(x0, 0, W - x0, h, 20, dark.g.surface);
    right += text(x0 + 24, 34, "ACCENT", { size: 10, weight: 600, fill: dark.t.secondary, ls: "0.08em" });
    cols.forEach(([name], i) => (right += text(c0 + i * (chipW + 8), 34, name.toUpperCase(), { size: 10, weight: 600, fill: dark.t.secondary, ls: "0.08em" })));
    list.forEach(([k, p], r) => {
      const y = 56 + r * rowH;
      right += place(rendered[k]["icon-dark"], x0 + 24, y, 24);
      right += text(x0 + 58, y + 17, p.name, { size: 13, weight: 500, fill: dark.t.primary });
      cols.forEach(([, f], i) => {
        const [hex] = f(p);
        const x = c0 + i * (chipW + 8);
        right += rect(x, y, chipW, 24, 7, hex);
        right += text(x + chipW / 2, y + 16, hex, { size: 11, fill: on(hex), family: MONO, anchor: "middle" });
      });
    });
    out.accents = doc(h, left + right);
  }

  // --- The ladder: one lit piece, the rest of the ink stepping down.
  {
    const pane = (mode, x) => {
      const { g, t, ink, label } = modes[mode];
      const p = products.paperside;
      const lit = mode === "dark" ? p.shades.dark : p.shades.lightGraphic;
      const steps = [["lit", lit, 1], ...M.ladder.map((o) => [String(o), ink, o])];
      let body = rect(x, 0, 428, 230, 20, g.ground, ` stroke="${g.line}"`);
      body += text(x + 24, 34, label.toUpperCase(), { size: 10, weight: 600, fill: t.secondary, ls: "0.08em" });
      steps.forEach(([name, fill, o], i) => {
        const sx = x + 24 + i * 44;
        body += rect(sx, 56, 36, 110, 8, fill, ` opacity="${o}"`);
        body += text(sx + 18, 186, name, { size: 11, fill: t.secondary, family: MONO, anchor: "middle" });
      });
      body += place(rendered.paperside[`mark-${mode}`], x + 300, 64, 104);
      body += text(x + 352, 196, "one lit, three on the ladder", { size: 11, fill: t.secondary, anchor: "middle" });
      return body;
    };
    out.ladder = doc(230, pane("dark", 0) + pane("light", 452));
  }

  // --- Type: names in Geist Medium, beside their marks.
  {
    const face = `@font-face{font-family:"Geist Figure";src:url(data:font/woff2;base64,${font}) format("woff2");font-weight:100 900}`;
    const G = `'Geist Figure', Geist, ${SANS}`;
    const wm = T.type.wordmark;
    const pane = (mode, x) => {
      const { g, t, ink, label } = modes[mode];
      let body = rect(x, 0, 428, 250, 20, g.ground, ` stroke="${g.line}"`);
      body += text(x + 24, 34, label.toUpperCase(), { size: 10, weight: 600, fill: t.secondary, ls: "0.08em" });
      body += text(x + 22, 150, "Aa", { size: 104, weight: wm.weight, fill: ink, family: G, ls: wm.tracking });
      ["lyrate", "avia"].forEach((k, i) => {
        const y = 70 + i * 68;
        body += place(rendered[k][`mark-${mode}`], x + 196, y, 40);
        body += text(x + 248, y + 32, products[k].name, { size: 36, weight: wm.weight, fill: t.primary, family: G, ls: wm.tracking });
      });
      body += text(x + 24, 220, `${wm.family} Medium · ${wm.weight} · ${wm.tracking.replace("-", "−")} · sentence case`, { size: 12, fill: t.secondary });
      return body;
    };
    out.type = doc(250, pane("dark", 0) + pane("light", 452), `<style>${face}</style>`);
  }

  return out;
}
