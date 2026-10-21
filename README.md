# developer.audiencekit.com

The AudienceKit developer documentation, built with [Astro Starlight](https://starlight.astro.build) and served at
https://developer.audiencekit.com.

```sh
npm install
npm run dev     # http://localhost:4321
npm run build   # static site in dist/
```

The site is built from three sources:

- **This repository**: the home page, the site settings (`astro.config.mjs`), the theme mapping
  (`src/styles/audiencekit.css`) and the build scripts.
- **The API's docs bundle**: the guides and API pages, the GraphQL schema dumps (SDL and introspection) of the public
  endpoints, the document validator, and the design system tokens. The AudienceKit API exports it on every build of
  its `main` and `next` branches and commits it here as [`bundles/main/` and `bundles/next/`](bundles/).
  `scripts/bundle.mjs` installs it, and `scripts/graphql-reference.mjs` generates the GraphQL reference from it.
- **[audience-kit-sdk](https://github.com/lwm-luminx/audience-kit-sdk)**: the SDK pages, from its READMEs and
  changelog (`scripts/sdk.mjs`).

Pushes to `main` (including each new bundle) and a daily run publish the build to the `gh-pages` branch (`.github/workflows/site.yml`).
See [Contribute to these docs](src/content/docs/project/contributing-docs.md) for details and the writing guide.
