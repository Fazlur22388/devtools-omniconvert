software
Deal: blue-black-cornflower, Instrument Sans + DM Mono, collage, nav-centre, footer-columns, close-type, surface-pairs, tonal, ring. The near-black ground keeps the file workspace distinct; sky-blue identifies available actions. Counter-rolls was redrawn as liquid-type because this app has no customer or performance statistics to animate.

Fact sheet: existing OmniConvert name; PDF-to-JPEG/PNG/WebP; image-to-JPEG/PNG/WebP; browser-local conversion; 100 MB file limit from existing validation; selectable PDF pages; individual image and ZIP downloads. The old image-to-PDF and PDF-to-text routes were placeholders that opened the wrong converter, so they are labeled in development. PDF resolution comes from 72 DPI multiplied by render scale, not the former approximate labels.

Voice: technical and dry; second person; exact formats and actions; no invented speed, security certification, usage figures, or customer proof.

Screens:
- hero: category and local processing; actual PDF converter in the right column, not a mock; upload, format, resolution, quality. The collage composition is adapted to keep real controls accessible and uncut. Tablet and phone stack text then the tool. Conversion results expand naturally rather than getting clipped to a marketing-screen height.
- converters: searchable, categorized tool library; clickable cards for implemented converters; noninteractive cards for planned converters. Content dictates height as search and filters change.
- how-it-works: file, output, download sequence with three static UI illustrations, stacked on phones.
- privacy: actual local-processing mechanism and memory limitation; liquid-type on the short statement; reduced motion and touch use the still.
- footer: close-type action and directory, one shared width.

Motion: unmodified kit motion.css and motion.js provide hover, press, and the hero entrance; unmodified liquid-type provides the one pointer moment on the privacy statement. No timed marketing loops, scroll reveals, stock images, or unnecessary WebGL.

Scope adaptations: this is an existing interactive conversion app, not a new marketing site. Real upload controls, search results, converted page lists, and dedicated tool routes take priority over rigid screen heights and clipping. No public deployment or new framework. No stock photographs or third-party product logos are needed. All file icons are interface glyphs. The existing brand is retained, so no name search is needed. No assumed commercial facts or contact details. Canonical domain and share image remain unspecified until a production domain exists.

Verification:
- Production build and TypeScript checks pass.
- All five implemented converter routes, unavailable-tool states, local font files, motion modules, and the local PDF worker return HTTP 200.
- The PDF-to-PNG route starts with PNG selected, rather than reusing the JPEG default.
- Screenshot review at 1440×900, 1024×768, 820×1180, 768×1024, and 390×844; the upload action is visible on the first phone screen. The complete converter window continues below the fold on smaller screens.
- Copy lint: zero failures. Its remaining warning identifies the category counts 8/4/3/1; these are calculated from the actual tool registry, not invented usage statistics.
- Performance: zero failures at 1440 and 390; about 356 KiB initial transfer, zero broken requests, zero layout shift. The parsed JavaScript budget warns at about 724 KiB including Next.js/React. Local CPU measurements are not production field data.
- Browser checks found no JavaScript exceptions in the initial views. Actual conversion and download actions were reviewed in code; end-to-end uploads/downloads were not automated by the skill's layout scripts.

Explicit checker waivers:
- `no-visual`, tool library: this is the real searchable directory, using format labels and SVG interface icons, not a feature section needing a photograph.
- `container-edges`, search label: the visible label is intentionally aligned with the search field on the right edge of the toolbar.
- `hero-lines`, substituted stress-test heading: the actual headline fits three lines; the checker inserts different, longer copy.
- `edge-left`, converter window title: the title is aligned inside the actual app window with its file icons, rather than with the outside page margin.

The screen-height, screen-neighbor, and mobile hero-fold rules remain exceptions: the library changes height with search/filter results, and the live converter expands to display files and pages. Content remains visible and interactive instead of being clipped to a marketing-screen height. No checker or kit source was edited.
