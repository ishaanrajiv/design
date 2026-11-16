# Agent instructions

## This repository is public

Everything committed here, including commit messages and PR text, is published on GitHub. Don't add:

- details of private infrastructure: servers, hostnames, IPs, ports, paths outside this repo, other repositories, internal tools or services, or how they're run.
- screenshots of apps or devices, or third-party images (photos, book covers, logos). Draw what you need in code, or describe it in words.
- personal details beyond the copyright line, or secrets of any kind.

Product names are fine. Every product goes by its own name in tokens, keys, comments, docs and file names: Lyrate, Avia, Tern (the macOS terminal, [ishaanrajiv/tern](https://github.com/ishaanrajiv/tern)), the site, Paperside, Hocin, Homelab, Otto, Library, Books, Primer and Undercut. A mark may have a name of its own (Lyrate's Riffle, Hocin's Throw). Naming a product doesn't make its details public: what it runs on, where, and how stay out.

When unsure whether something belongs, leave it out and ask.

## Voice

Write in the first person: "I" for my own choices, "we" for decisions reached by working them through. Never "the owner" or "the user".

## Working here

- `tokens/tokens.json` and `marks/marks.mjs` are the sources. Run `node scripts/build.mjs` after changing either, and commit the outputs (`dist/`, `marks/out/`, `docs/products.md`, `docs/img/`) with the change.
- Don't edit generated files by hand. `docs/products.md` and the figures in `docs/img/` come from `scripts/build.mjs` and `scripts/figures.mjs`.
- Record each decision, with what was turned down, in `docs/decisions.md`, newest first.
- Exploration pages made while deciding stay out of the repo. Summarise them in `docs/decisions.md` instead.
- Licence terms: the code is MIT, the marks and names are reserved ([NOTICE.md](NOTICE.md)). Keep new files in the right camp.
