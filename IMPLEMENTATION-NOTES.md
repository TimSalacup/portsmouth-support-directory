# Local implementation handoff

Source: supplied portsmouth-support-directory-main.zip, archive comment a76ca0395f481acb82899b405237a46320341842; SHA-256 34c7e7df6bfc260adb34387d32d6139c92fce2d3bc730c0dc19213cf4d71215f.

The actual supplied source was updated locally. No push, PR or deployment was performed.

## Required dependency step

Network policy blocked npm registry access (HTTP 403); no usable installed or cached dependencies were found. The original package-lock.json was removed because it does not contain the new Tailwind dependency graph. This ZIP intentionally has no lockfile. Run `npm install` in an authorized network-enabled environment to generate a fresh package-lock.json; review and retain it. Then run `npm run build` and `npm run lint`. Do not use `npm ci` until that lockfile exists. Existing project dependency version ranges were preserved and their availability could not be verified here.

## Validation limits

Archive CRC and safe extraction checks passed. Source structure, exact category order, responsive utility classes and noninteractive semantics were checked locally. Build and lint were attempted but cannot execute without dependencies. Authentic running before/after screenshots and browser layout checks are unavailable; no static mock or fallback is represented as an actual render.


## Blue header revision

Navigation removed. The only two page regions are a full-bleed radial header and white main grid. Header uses BBH Bogle Regular (400), confirmed against Google Fonts metadata, and a hard cut to the white content area. Google Fonts URL includes BBH+Bogle and Montserrat. Logo is not displayed. Palette samples: navy #0D3C7C and source bright blue #00B1F8; softened blue header stops #D8EEFC, #A6DEFA, #E6F4FD, with sparing apricot #FFD1A6 at the right-hand center.

All 12 supplied WebPs are imported from src/assets/categories with normalized meaningful names, mapped by case-insensitive exact category names. Each is decorative (empty alt), lazy-loaded, full-card object-fit cover. Opacity rises from .12 to .24 and only the image scales to 1.035 on hover; text never scales. Navy text stays above the image. Reduced motion removes image transitions and scale, alongside the prior pointer/underline safeguards. No actions, links or footer added.

Source and archive checks performed; actual browser rendering, build and lint remain unverified because dependencies are unavailable. No screenshot claimed.


## Sunrise and title revision

Header radial circle moved to the bottom-left with its center on the bottom edge, clipped so its upper half appears above the crisp white content boundary; the decorative pseudo-element sits behind the title. Heading has explicit block lines PORTSMOUTH and SUPPORT DIRECTORY, separated by a real space for normal spoken text, with responsive no-wrap line sizing. Card 11's top border removed. All card hover cursors are pointers without adding actions. Neutral shadows increased moderately. Card titles now use BBH Bogle 400; the grid allocates roughly 60% of inner card height to the wrapping title block and the remaining space to view. Existing images, category order, hover animations, reduced motion and 3/2/1 layout preserved.


## Dark image cards and spacing revision

Header is now 95vh. White separation before cards is 112px on desktop (previously 80px) and 80px on mobile (previously 64px). BBH Bogle title sizing is unchanged. The 60% spacer is removed: view follows each title naturally with a 24px margin. View is 13px with a 1em SVG. Each dark-base card has separate image (z-index 0, .5 idle/.6 hover), fixed black .6-opacity overlay (z-index 1), and white foreground (z-index 2). Stronger broad neutral layered shadows replace the former lighter shadow. Images alone retain hover zoom; pointer, underline, reduced motion, labels/order and breakpoints are unchanged. Build/lint remain blocked by unavailable dependencies; no authentic rendered screenshot is claimed.


## Interactive expansion revision (supersedes earlier static-card notes)

One full-width white SVG wave replaces the straight boundary; 95vh sunrise and forced two-line heading remain. Exactly two decorative portrait cards sit in a stable upper-right hover area: rear -10deg/front +7deg, fanning to -17deg/+13deg around the same lower-left pivot, returning on leave. Front uses supplied portsdown.webp unchanged. The fan reduces its size on mobile and short screens.

Categories are now real buttons. Selection preserves its original row, translates to the grid's first column, fades and makes all other categories inert, centers the card vertically, then reveals a transparent detail area in the remaining columns. Mobile inserts a detail row immediately below the selection. Details contain the category heading and visible lorem ipsum only. Return has a left arrow, restores the grid/trigger focus/previous scroll; Escape also closes. Transition timers are cleaned up on phase changes/unmount. Reduced motion removes transitions, animated fan changes and smooth scrolling.

Validation: input/archive CRC passed; all category images and package.json/package-lock.json match supplied bytes; practice photo matches supplied bytes. JSX parsed with available Babel parser. 864 responsive selection-slot combinations passed. Offline Chromium fixture using actual CSS checked every category at 320/768/1440px: selected card at grid left, no card/detail overlap, no horizontal overflow, and 11 inert other cards. This is isolated CSS validation, NOT a full React app render. Google font loading and real React event/focus/scroll behavior were not browser-tested. npm ci was attempted with the supplied lockfile and returned registry HTTP 403; build/lint cannot run (vite/eslint unavailable). No screenshot or full-build success claimed. Lockfile is preserved; no dependency additions. No push, PR or deployment.


## PDF segments and locked detail viewport (current revision)

Integrated the supplied ports­mouth-directory-data.json as src/directory-data.json without altering its bytes. There are 75 records across 12 categories (9, 1, 2, 1, 2, 1, 10, 5, 11, 18, 5, 10 in displayed category order). Each record renders title, description, then contacts. Contact hyperlinks come only from the supplied extraction. Extraction/source-contact verification is not independently reasserted here.

After selection aligns, the document is fixed in place with scrollbar-width compensation; the detail content owns vertical overflow. Cleanup restores body/root styles and document position on closing, Escape, resize, or unmount. Return restores the original trigger and prior grid scroll. Compact selected cards on mobile leave room for the detail viewport; controls stay outside its scrollable area. Keyboard, wheel and touch operate within one segment. A wheel gesture may scroll a long segment OR advance one record, never both; post-step momentum is suppressed until a quiet period. Fresh reverse gestures, keyboard, and a visible Previous button allow return to earlier records.

The down-chevron button is centered just outside the bottom of the detail panel, pulses only when motion is allowed, and is omitted at the last/only record. Separate top/bottom fades indicate internal overflow and never intercept input. Return is rounded navy, lightens on hover, and shifts its left arrow slightly left. All CSS transitions use ease-out. Reduced motion disables pulse, entrance animation, hover translations and smooth scrolling. Header fan moved right and remains above center; responsive clearance was checked both idle and fanned.

Validation: JSX/module parsing passed; supplied JSON keys/counts/schema/URL schemes validated; unchanged original assets/package/lockfile bytes checked. `node tests/navigation.test.mjs` passes momentum/direction/boundary/cooldown/data assertions. `PLAYWRIGHT_MODULE=<installed-playwright-path> node tests/browser-offline.cjs` passes actual DOM-module wheel/touch/keyboard/cleanup/scroll-lock geometry checks and isolated actual-CSS overflow/control reachability at 320x568, 390x844, 768x600, 1440x900 and 800x360. Separate header bounds checks passed at four widths, idle and hover. Escape/tab/inert/focus integration paths were source-reviewed; a full React/browser integration test remains unavailable. These are not app screenshots or a verified production render. Build/lint were attempted and fail because vite/eslint are unavailable following the registry HTTP 403 installation block. No dependency changes; supplied lockfile preserved. No push, PR or deployment.


## Bidirectional slide, symmetric arrows and verified phone supplement

Up/down chevron buttons are symmetric above/below the detail panel. Unavailable controls use hidden, with explicit accessible labels; both pulse unless reduced motion is requested. Before a record change, focus moves to a stable window element, then to the new heading after the animation commits. This avoids focus falling into the document when an arrow becomes unavailable.

A shared overflow-hidden window holds two full-height panes simultaneously. Forward: outgoing travels from 0 to -100%, incoming from +100% to 0. Backward reverses both directions. Both use 440ms ease-out transforms, not opacity-only animation. Top/bottom fades stay above the panes. Outgoing/incoming contacts are inert during movement; input continues to reach the stable window so wheel momentum cannot trigger another record. Long outgoing content preserves its scroll position until replaced; the new segment resets to its top before painting. Return/Escape and resize still close and release the lock; reduced motion changes records without travel or pulse.

In the two-column breakpoint only, selected card and detail panel align vertically at their centers. Normal grid and mobile stacking retain their original alignment. Arrow clearance is reserved in the locked viewport, including mobile.

Phone integration used the supplied verified supplement, exact category slug plus exact segment title, deduplicated by href. Added 46 tel: links across 45 existing entries; all 75 entries, descriptions, order and previous contacts/website links are retained. One unmatched supplement entry, mental-wellbeing-resources / Portsdown Group Practice, was omitted as requested. Crisis-category contacts were not modified and remain links-only. The provider verification was supplied by the coordinating task, not independently repeated in this implementation.

Validation: JSX parses; existing momentum/data tests and actual DOM-module navigation/scroll-lock tests pass. New offline browser tests measure both pane transforms at 110ms in each direction, verify clipping and full-opacity visible travel, and verify the incoming pane stops at the previous position at 440ms. Reduced-motion disables travel. Isolated actual-CSS tests at 320x568, 768x600, 1000x900, 1440x900 and 800x360 verify both arrows fit, long content can scroll, there is no card/detail overlap or horizontal overflow, two-column centers match, and the stable DOM focus sequence survives arrow hiding. Existing responsive checks also pass. These fixtures are not a full React application render. Full React lifecycle, Escape/resize interaction and font rendering remain unverified end-to-end; their source paths were reviewed. npm ci again returned registry HTTP 403. Build/lint were attempted but vite/eslint remain unavailable. No push, PR, publication or fabricated screenshot.
