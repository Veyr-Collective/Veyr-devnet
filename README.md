# VEYRINDEX

Static blacksite-styled development network for **VEYR COLLECTIVE**.

## Purpose

VEYRINDEX is the public mirror for Veyr Armory records, the Veyr Attachment
Index, development intelligence, project status, technical documentation,
media, and release signals. Active builds and unstable implementation details
remain off-grid until they are cleared for public access.

## Architecture

The site intentionally uses plain HTML, CSS, JavaScript, and JSON so it can run
on GitHub Pages without a build step.

```text
index.html
armory/
attachments/
downloads/
documentation/
projects/
intel/
operators/
gallery/
changelog/
about/
data/
  weapons.json
  attachments.json
  projects.json
  intel.json
assets/
  styles.css
  navigation.js
  data.js
  site.js
  media/
```

## Shared Systems

- `assets/navigation.js` mounts the global navigation and node-status panel.
- `assets/data.js` renders weapon records, project status, attachment filters,
  the compatibility matrix, Intel entries, and dashboard metrics from JSON.
- `assets/site.js` runs the clock, Night City weather feed, boot sequence, and
  cosmetic network console.

## Content Rules

- Public: development logs, showcases, redacted records, compatibility states,
  documentation, and validated release pages.
- Private: unstable systems code, extracted assets, internal working paths, and
  unfinished implementation details that have no reason to be public.
