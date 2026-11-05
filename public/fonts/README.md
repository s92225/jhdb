# JHDB self-hosted Chinese fonts

Noto Sans TC (400 and 500) and Noto Serif TC (500), from the official Google Fonts repository. SIL Open Font License 1.1; the original licence files are included alongside the fonts.

- https://github.com/google/fonts/tree/main/ofl/notosanstc
- https://github.com/google/fonts/tree/main/ofl/notoseriftc

Subset with FontTools to the characters present in `app`, `lib`, and `data`, plus Latin-1 and interface punctuation. Real regular and medium instances are self-hosted as WOFF. The skills workbench disables synthetic font weight and uses the real 400/500 faces for clearer Chinese counters at small sizes. Newly introduced characters can fall back to the operating system's Chinese font. Re-subset from the upstream TTFs when adding significant new content.

Self-hosting avoids third-party font requests for visitors and removes Google Fonts network access as a build-time dependency.

