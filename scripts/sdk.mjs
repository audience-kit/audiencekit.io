// Imports the public SDK's documentation from lwm-luminx/audience-kit-sdk into src/content/docs/sdks/: its READMEs
// (one per platform) and the changelog, as Starlight pages. Links between imported files become site links; links to
// anything else in the repository point at GitHub.
//
//   node scripts/sdk.mjs            # .sdk/ (CI's checkout), else ../audience-kit-sdk, else a shallow clone into .sdk/
//   node scripts/sdk.mjs path/to/sdk
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = 'https://github.com/lwm-luminx/audience-kit-sdk';

// Source file in the SDK repository -> page slug under sdks/, sidebar label and order.
const PAGES = {
	'README.md': { slug: 'overview', label: 'Overview', order: 0, description: 'The open-source AudienceKit SDKs for Swift and Kotlin: one repository, one version.' },
	'swift/README.md': { slug: 'swift', label: 'Swift', order: 1, description: 'AudienceCore, AudienceKit and AudienceKitUI, the Swift package for iOS, macOS and Linux.' },
	'core/README.md': { slug: 'core', label: 'Kotlin Multiplatform core', order: 2, description: 'audiencekit-core, the Kotlin Multiplatform code shared by every platform.' },
	'android/README.md': { slug: 'kotlin', label: 'Kotlin (Android and JVM)', order: 2.5, description: 'The audiencekit Kotlin client and audiencekit-android.' },
	'CHANGELOG.md': { slug: 'changelog', label: 'Changelog', order: 9, description: 'Every release of the AudienceKit SDKs.' },
};

function locate(arg) {
	if (arg) return resolve(arg);
	for (const dir of [join(site, '.sdk'), resolve(site, '../audience-kit-sdk')]) if (existsSync(join(dir, 'VERSION'))) return dir;
	execFileSync('git', ['clone', '--depth', '1', `${REPO}.git`, join(site, '.sdk')], { stdio: 'inherit' });
	return join(site, '.sdk');
}

const sdk = locate(process.argv[2]);
const version = readFileSync(join(sdk, 'VERSION'), 'utf8').trim();
const quote = (text) => JSON.stringify(text);

function rewriteLinks(markdown, from) {
	return markdown.replace(/(\]\()([^)\s]+)(\))/g, (match, open, target, close) => {
		if (/^([a-z]+:|#|\/)/i.test(target)) return match;
		const [path, hash = ''] = target.split('#');
		const file = posix.normalize(posix.join(posix.dirname(from), path));
		const page = PAGES[file];
		const anchor = hash ? `#${hash}` : '';
		if (page) return `${open}/sdks/${page.slug}/${anchor}${close}`;
		const kind = existsSync(join(sdk, file)) && !/\.[a-z0-9]+$/i.test(file) ? 'tree' : 'blob';
		return `${open}${REPO}/${kind}/main/${file}${anchor}${close}`;
	});
}

const out = join(site, 'src/content/docs/sdks');
mkdirSync(out, { recursive: true });
for (const [from, page] of Object.entries(PAGES)) {
	let body = readFileSync(join(sdk, from), 'utf8');
	// The README's own title becomes the page title.
	const h1 = body.match(/^# (.+)\n+/);
	const title = h1 ? h1[1] : page.label;
	if (h1) body = body.slice(h1[0].length);
	const frontmatter = [
		'---',
		`title: ${quote(title)}`,
		`description: ${quote(page.description)}`,
		'sidebar:',
		`  label: ${quote(page.label)}`,
		`  order: ${page.order}`,
		'editUrl: ' + quote(`${REPO}/edit/main/${from}`),
		'---',
		'',
		`<!-- Imported by scripts/sdk.mjs from ${from} in audience-kit-sdk ${version}. Edit it there. -->`,
		'',
	].join('\n');
	writeFileSync(join(out, `${page.slug}.md`), frontmatter + rewriteLinks(body, from));
}
writeFileSync(join(site, 'src/sdk.json'), `${JSON.stringify({ version }, null, 2)}\n`);
console.log(`Imported ${Object.keys(PAGES).length} pages from audience-kit-sdk ${version}`);
