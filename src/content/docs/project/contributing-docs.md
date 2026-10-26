---
title: Contribute to these docs
description: How developer.audiencekit.com is built, where its pages come from, and how to preview a change.
---

developer.audiencekit.com is built with [Astro Starlight](https://starlight.astro.build) in the public [lwm-luminx/developer.audiencekit.com](https://github.com/lwm-luminx/developer.audiencekit.com) repository, from three sources:

| Source | What it provides | Where to change it |
| --- | --- | --- |
| This repository | The home page, this page, the theme mapping and the site settings | Here |
| The API's docs bundle | The Start here, API and Guides pages, the Ruby SDK page, the GraphQL schema dumps and validator, and the design system tokens | The AudienceKit API repository (`docs/developer/` and the schema in `api/`) |
| [audience-kit-sdk](https://github.com/lwm-luminx/audience-kit-sdk) | The Swift, Kotlin and changelog pages, from its READMEs | That repository's READMEs |

## The API's docs bundle

The API exports a bundle (`api/bin/developer-docs.mjs`) on every build of its `main` and `next` branches and commits it to this repository as `bundles/main/` and `bundles/next/`. Each bundle has a `manifest.json` with the channel, the commit it was built from, the API contract version, the public GraphQL views (endpoint path, SDL and introspection files) and a SHA-256 for every file. The push starts this site's build.

The site is built from the `main` bundle, so it documents what production serves. The `next` bundle's schema dumps are published beside it:

| URL | What it is |
| --- | --- |
| `/graphql/schema.graphql`, `/graphql/schema.json` | The consumer view (SDL and introspection), as production serves it |
| `/graphql/staff_schema.graphql`, `/graphql/staff_schema.json` | The staff view (`staffql`) |
| `/graphql/check.mjs` | The [document validator](/api/validate-documents/) |
| `/graphql/next/…` | The same files from the API's `next` branch |
| `/graphql/manifest.json` | Which bundle versions the site was built from |

## Preview locally

You need Node 22.

```sh
npm install
npm run dev     # http://localhost:4321
npm run build   # writes the static site to dist/
```

`dev` and `build` first install the sources (`npm run sources`). The bundle comes from `bundles/main/`; to preview a change to the API's pages before pushing it, run `node scripts/bundle.mjs ../audience_kit_api`, which exports a fresh bundle from that checkout. The SDK pages come from `../audience-kit-sdk`, or a shallow clone. `node scripts/sdk.mjs <dir>` takes another directory.

## Publishing

Every push to `main` (including each new bundle) and a daily run (to pick up SDK changes) build the site and publish it to the `gh-pages` branch, which GitHub Pages serves at https://developer.audiencekit.com. Pull requests build without publishing.

## Look and feel

The docs use the AudienceKit design system's default theme. The bundle carries the design system's generated `tokens.css` and fonts, and `src/styles/audiencekit.css` maps them onto Starlight. Starlight's light and dark modes map to the design system's `light` and `dark` themes.

## Writing style

- Write in second person and sentence case, and lead with what the reader can do.
- Take facts from the code, and link to the file when it helps.
- Keep examples runnable: real endpoints, real field names, and placeholders in `<angle brackets>` or `$VARIABLES`.
- Don't edit the GraphQL reference by hand. It's generated from the bundle's schema dumps (`scripts/graphql-reference.mjs`), so change the schema in the API and regenerate its dumps.
