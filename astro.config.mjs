// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// developer.audiencekit.com: the AudienceKit developer documentation.
export default defineConfig({
	site: 'https://developer.audiencekit.com',
	integrations: [
		starlight({
			title: 'AudienceKit',
			description: 'Developer documentation for AudienceKit, the multi-tenant platform for audiences, places and events.',
			favicon: '/favicon.png',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/lwm-luminx/audience-kit-sdk' }],
			editLink: { baseUrl: 'https://github.com/lwm-luminx/developer.audiencekit.com/edit/main/' },
			// src/theme/ is the design system's tokens and fonts, from the API's bundle.
			customCss: ['./src/theme/tokens.css', './src/styles/audiencekit.css'],
			lastUpdated: true,
			// Google Analytics 4: the AudienceKit property, whose one web stream also covers audiencekit.com and the console.
			head: [
				{ tag: 'script', attrs: { async: true, src: 'https://www.googletagmanager.com/gtag/js?id=G-W5LTH459WQ' } },
				{
					tag: 'script',
					content: "window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-W5LTH459WQ');",
				},
			],
			// The start, API and guide pages come from the API's bundle and the SDK pages from audience-kit-sdk
			// (scripts/bundle.mjs, scripts/sdk.mjs); each page's sidebar.order frontmatter sets its place.
			sidebar: [
				{ label: 'Start here', items: [{ autogenerate: { directory: 'start' } }] },
				{ label: 'API', items: [{ autogenerate: { directory: 'api' } }] },
				{ label: 'Guides', items: [{ autogenerate: { directory: 'guides' } }] },
				{ label: 'SDKs', items: [{ autogenerate: { directory: 'sdks' } }] },
				{ label: 'Project', items: [{ label: 'Contribute to these docs', slug: 'project/contributing-docs' }] },
			],
		}),
	],
});
