# Homepage fonts

Self-hosted WOFF subsets of Noto Sans TC (regular/medium) and Yuji Boku,
plus the upstream Inter variable TTF used by existing inner pages.
The corresponding SIL Open Font License files are included in this directory.
Uncovered characters fall back to the visitor's system Chinese font.

- https://github.com/google/fonts/tree/main/ofl/notosanstc
- https://github.com/google/fonts/tree/main/ofl/yujiboku
- https://github.com/google/fonts/tree/main/ofl/inter

Inter and Noto Sans TC are loaded through `next/font/local`, so builds no
longer depend on hundreds of Google Fonts network requests.
