# Agent instructions

## This repository is public

Everything committed here, including commit messages and PR text, is published on GitHub. Don't add:

- names of products that haven't launched. The public products are **Lyrate**, **Avia**, **Tern** (the macOS terminal, [ishaanrajiv/tern](https://github.com/ishaanrajiv/tern)) and **the site**. A product becomes public when its app or repo is. Every other product goes by the name of its mark (Panels, Throw, Dish, Face, Shelf, Book, Cited line, Tyre) in tokens, keys, comments, docs and file names. If you know the real name, don't write it here.
- details of private infrastructure: servers, hostnames, IPs, ports, paths outside this repo, other repositories, internal tools or services, or how they're run.
- screenshots of apps or devices, or third-party images (photos, book covers, logos). Draw what you need in code, or describe it in words.
- personal details beyond the copyright line, or secrets of any kind.

When unsure whether something belongs, leave it out and ask.

## Voice

Write in the first person: "I" for my own choices, "we" for decisions reached by working them through. Never "the owner" or "the user".

## Working here

- `tokens/tokens.json` and `marks/marks.mjs` are the sources. Run `node scripts/build.mjs` after changing either, and commit the outputs (`dist/`, `marks/out/`, `docs/products.md`, `docs/img/`) with the change.
- Don't edit generated files by hand. `docs/products.md` and the figures in `docs/img/` come from `scripts/build.mjs` and `scripts/figures.mjs`.
- Record each decision, with what was turned down, in `docs/decisions.md`, newest first.
- Exploration pages made while deciding stay out of the repo. Summarise them in `docs/decisions.md` instead.
- Licence terms: the code is MIT, the marks and names are reserved ([NOTICE.md](NOTICE.md)). Keep new files in the right camp.
