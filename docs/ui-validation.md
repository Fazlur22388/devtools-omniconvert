GATE: OPEN 8 (rounds used up)

The redesign is implemented and the production build and TypeScript checks pass. The skill completed three review rounds. The eight remaining failures are its rigid screen-height, screen-neighbor, and mobile hero-fold requirements. These were kept open explicitly because the working converter and searchable directory grow with their contents. This report does not claim full gate compliance.

See [the design plan](ui-design.md) for the palette, pairing, composition, copy register, assets, and scope decisions.

Validation performed:

- Production build including TypeScript: passed.
- Representative converter, unavailable-tool, font, worker, and motion-module HTTP responses: passed.
- PDF-to-PNG initial format: PNG selected.
- Browser JavaScript exceptions: none at 1440 and 390.
- Screenshot review: 1440x900, 1024x768, 820x1180, 768x1024, 390x844. The full converter remains visible by scrolling at smaller widths; its upload action is in the first phone view.
- Copy lint: zero failures, one warning for the category counts computed from the registry.
- Performance: zero failures, two parsed-JavaScript warnings, roughly 356 KiB transfer, no broken requests, zero layout shift, two font families, and zero WebGL contexts. CPU-only local measurements are not production field data.
- Actual file upload, conversion, and download actions were reviewed in source; end-to-end file interactions were not automated by the layout scripts.

Open findings:

| Check | Widths | Location | Finding |
| --- | --- | --- | --- |
| section-height | 1440, 390 | section#converters "A tool for your next file.Choose the for" | the section is 1151px tall (1.3 screens), 251px over one screen (900px): every section after the hero is one screen or two, 2px either way (SR-2) |
| section-height | 1440 | section#how-it-works "From file to download.Keep control over " | the section starts at 2051px, 251px below the screen grid (2 x 900px): sections start on whole screens (SR-2) |
| section-height | 1440 | section#privacy "Local by designYour browser.Your files.O" | the section starts at 2951px, 251px below the screen grid (3 x 900px): sections start on whole screens (SR-2) |
| section-height | 1440 | footer#contact "Your next file,in the right format.Conve" | the section starts at 3851px, 251px below the screen grid (4 x 900px): sections start on whole screens (SR-2) |
| one-section | 1440 | section#converters "A tool for your next file.Choose the for" | the screen at scroll 1800px (stride 2) shows 171px of section 2 and the content of 2 sections, over 24px each beside section 3: a screen shows one section (another may peek 8px, 24px WARN) (SR-4) |
| one-section | 1440, 390 | section#how-it-works "From file to download.Keep control over " | the screen at scroll 2700px (stride 3) shows 171px of section 3 beside section 4: a screen shows one section (another may peek 8px, 24px WARN) (SR-4) |
| hero-fold | 390 | section.hero.hero--collage section.hero.hero--collage "Your files stay on your deviceFi" | ends at y 1220, past the fold (844): 1.45 screens tall |
| hero-maxchars | 390 | section.hero.hero--collage section.hero.hero--collage "Your files stay on your deviceFi" | with a 48-character h1 (heroes.json maxChars): ends at y 1265, past the fold (844): 1.50 screens tall |

Explicit waivers:

- no-visual: This section is the real searchable tool directory, not a marketing feature section. Its actual interface uses format labels and inline SVG file icons; adding stock imagery would obscure the task.
- container-edges: The visible label belongs to the working search input aligned to the right content edge of the directory toolbar. It is an input label inside the app interface, not a section heading.
- hero-lines: The final page copy is File conversion inside your browser and fits three lines. The check substitutes a different 48-character headline that this app does not display.
- edge-left: PDF to image is the title inside the real converter window. It aligns with that window's file icons and does not belong on the page's outer text line.

Nonblocking browser warnings:

- no-visual: pictures, effects and mocks cover 17% of this section; a feature section needs a visual (about 25% or more)
- copy-headings: the card title "PDF to JPEG" names no product, part, place or section (5 card titles like it) (and 4 more like it: "PDF to PNG", "JPG to PNG", "PNG to JPG", "PDF to Text")
- copy-buttons: "Convert a PDF" does not start with a verb (book, buy, try, start, get, see...) (and 1 more like it: "Browse all tools")
- copy-actions: the main action "Choose a PDF" does not read word for word the same in the closing section
- copy-length: 2 sections over 90 words a screen outside the UI mocks ("A tool for your next fil" 144, "File conversion inside y" 102); 94 words a screen across the page (403 words in 4.3 screens): a tech page says it in about 80 or fewer
- button-contrast: the button "Browse all tools" (#181b22) stands only 1.13:1 off the ground around it: it reads as part of the ground, or as switched off
- empty-area: 35% of the section is empty: 128px of empty rows between its content, 144px under its last (div.footer-legal), in its 760px of rows (WARN over 35%, FAIL over 50%)
- share-meta: the head lacks og:image: a shared link shows no picture or title of its own
- one-section: the screen at scroll 3600px (stride 4) shows 171px of section 4 beside section 5: a screen shows one section (another may peek 8px, 24px WARN) (it is in a scroll scene: told as a WARN) (SR-4)
- tap-size: a 139x42px tap target: under the 44px a phone needs
- tap-size: a 311x42px tap target: under the 44px a phone needs
- no-visual: pictures, effects and mocks cover 18% of this section; a feature section needs a visual (about 25% or more)
- cta: a section over 1.5 screens long with no link or button in it
- tab-wrap: the row of 4 tabs wraps onto 2 lines and leaves "Documents 1" alone on the last

Warning decisions: format names and conversion verbs are correct interface labels even when the marketing-copy heuristic does not recognize them; category numbers are actual registry counts. The directory and tool controls are real app UI. The footer is intentionally spacious. Section-height/neighbor expectations, filter wrapping, the two 42px measured controls, secondary-button separation, and visual-coverage scores remain recorded rather than hidden. A share image and canonical production domain were not supplied. No business facts, contacts, stock photographs, customer proof, or artwork were invented; no client image slots or stand-ins are required.

The kit and checker source files were not changed. Fonts and their licenses are served from public/fonts, and the matching PDF worker and license are served locally. The temporary QA server used port 3001 because port 3000 serves another app. Start this project with `npm.cmd run dev -- --port 3001` to review it again.
