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
