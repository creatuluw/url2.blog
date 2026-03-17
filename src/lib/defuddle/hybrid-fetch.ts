import TurndownService from 'turndown';
import puppeteer from 'puppeteer';

export const DEFUDDLE_BASE_URL = 'https://defuddle.md';

export interface FetchResult {
	markdown: string;
	metadata: {
		title?: string;
		description?: string;
		image?: string;
		author?: string;
		site?: string;
		published?: string;
	};
	source: 'defuddle' | 'puppeteer';
	wordCount: number;
}

/**
 * Fetches markdown from a URL using a hybrid approach:
 * 1. Try defuddle.md API first (fast, works for static HTML sites)
 * 2. If content is insufficient (< 100 words), fall back to Puppeteer (renders JavaScript)
 */
export async function fetchMarkdownHybrid(url: string): Promise<FetchResult> {
	// Step 1: Try defuddle.md API first
	try {
		const defuddleResult = await fetchFromDefuddle(url);

		// Check if content is sufficient (at least 100 words)
		const wordCount = countWords(defuddleResult.markdown);

		if (wordCount >= 100) {
			console.log(`[HybridFetch] Defuddle succeeded with ${wordCount} words for ${url}`);
			return {
				...defuddleResult,
				source: 'defuddle',
				wordCount,
			};
		}

		console.log(`[HybridFetch] Defuddle returned only ${wordCount} words, falling back to Puppeteer for ${url}`);
	} catch (error) {
		console.warn(`[HybridFetch] Defuddle failed for ${url}:`, error);
	}

	// Step 2: Fall back to Puppeteer for JavaScript-heavy sites
	try {
		const puppeteerResult = await fetchFromPuppeteer(url);
		const wordCount = countWords(puppeteerResult.markdown);

		console.log(`[HybridFetch] Puppeteer succeeded with ${wordCount} words for ${url}`);
		return {
			...puppeteerResult,
			source: 'puppeteer',
			wordCount,
		};
	} catch (error) {
		console.error(`[HybridFetch] Puppeteer also failed for ${url}:`, error);
		throw error;
	}
}

async function fetchFromDefuddle(url: string): Promise<FetchResult> {
	const encodedUrl = encodeURIComponent(url);
	const response = await fetch(`${DEFUDDLE_BASE_URL}/${encodedUrl}`, {
		signal: AbortSignal.timeout(30000),
	});

	if (!response.ok) {
		throw new Error(`Defuddle error: ${response.status} ${response.statusText}`);
	}

	const markdown = await response.text();

	// Extract metadata from defuddle response (it returns frontmatter)
	const title = extractFrontmatterValue(markdown, 'title') || undefined;
	const description = extractFrontmatterValue(markdown, 'description') || undefined;
	const source = extractFrontmatterValue(markdown, 'source') || undefined;
	const domain = extractFrontmatterValue(markdown, 'domain') || undefined;

	return {
		markdown: markdown || '',
		metadata: {
			title,
			description,
			image: undefined,
			author: undefined,
			site: domain,
			published: undefined,
		},
		source: 'defuddle',
		wordCount: countWords(markdown),
	};
}

async function fetchFromPuppeteer(url: string): Promise<FetchResult> {
	const browser = await puppeteer.launch({
		headless: 'new',
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	});

	const page = await browser.newPage();
	await page.setUserAgent('Mozilla/5.0 (compatible; URL2Bot/1.0)');

	// Navigate and wait for network to be idle (all resources loaded)
	await page.goto(url, {
		waitUntil: 'networkidle0',
		timeout: 30000,
	});

	// Wait a bit extra for any dynamic content
	await new Promise(resolve => setTimeout(resolve, 2000));

	// Get the full rendered HTML
	const html = await page.content();

	// Extract metadata before converting to markdown
	const title = await page.$eval('title', el => el.textContent).catch(() => undefined);
	const description = await page.$eval('meta[name="description"]', el => el.getAttribute('content')).catch(() => undefined);
	const ogImage = await page.$eval('meta[property="og:image"]', el => el.getAttribute('content')).catch(() => undefined);
	const ogTitle = await page.$eval('meta[property="og:title"]', el => el.getAttribute('content')).catch(() => undefined);
	const ogDescription = await page.$eval('meta[property="og:description"]', el => el.getAttribute('content')).catch(() => undefined);

	// Convert HTML to markdown using turndown
	const turndownService = new TurndownService({
		headingStyle: 'atx',
		hr: '---',
		bulletListMarker: '-',
		codeBlockStyle: 'fenced',
		fence: '```',
		emDelimiter: '*',
		strongDelimiter: '**',
		linkStyle: 'inlined',
	});

	// Keep images and links
	turndownService.keep(['img', 'a']);

	const markdown = turndownService.turndown(html);

	await browser.close();

	return {
		markdown: markdown || '',
		metadata: {
			title: ogTitle || title,
			description: ogDescription || description,
			image: ogImage,
			author: undefined,
			site: new URL(url).hostname,
			published: undefined,
		},
		source: 'puppeteer',
		wordCount: countWords(markdown),
	};
}

function countWords(text: string): number {
	if (!text || text.trim().length === 0) return 0;

	// Remove frontmatter and code blocks for word count
	const content = text
		.replace(/^---[\s\S]*?---\n*/, '')
		.replace(/```[\s\S]*?```/g, '')
		.trim();

	return content.split(/\s+/).filter(word => word.length > 0).length;
}

function extractFrontmatterValue(markdown: string, key: string): string | null {
	const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
	const match = markdown.match(frontmatterRegex);

	if (!match) return null;

	const frontmatterString = match[1];
	const regex = new RegExp(`${key}:\\s*(.+)`, 'i');
	const valueMatch = frontmatterString.match(regex);

	return valueMatch ? valueMatch[1].trim().replace(/^["']|["']$/g, '') : null;
}

/**
 * Fetch URL metadata using defuddle.md API
 */
export async function fetchUrlMetadata(url: string): Promise<{
	title?: string;
	description?: string;
	excerpt?: string;
	thumbnail?: string;
	favicon?: string;
	author?: string;
	siteName?: string;
	publishedDate?: string;
}> {
	try {
		const response = await fetch(url, {
			signal: AbortSignal.timeout(30000),
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; URL2Bot/1.0)',
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error: ${response.status}`);
		}

		const html = await response.text();

		// Extract metadata from HTML
		const metadata = {
			title: extractMetaTag(html, 'og:title') || extractMetaTag(html, 'title') || undefined,
			description: extractMetaTag(html, 'og:description') || extractMetaTag(html, 'description') || undefined,
			excerpt: extractMetaTag(html, 'og:description') || undefined,
			thumbnail: extractMetaTag(html, 'og:image') || extractMetaTag(html, 'twitter:image') || undefined,
			favicon: undefined,
			author: extractMetaTag(html, 'article:author') || extractMetaTag(html, 'author') || undefined,
			siteName: extractMetaTag(html, 'og:site_name') || undefined,
			publishedDate: extractMetaTag(html, 'article:published_time') || extractMetaTag(html, 'og:published_time') || undefined,
		};

		// Try to extract favicon from link tags
		const faviconMatch = html.match(/<link[^>]+rel=["']icon["'][^>]+href=["']([^"']+)["']/i) ||
			html.match(/<link[^>]+href=["']([^"']+favicon[^"']+)["'][^>]*>/i);
		if (faviconMatch) {
			metadata.favicon = new URL(faviconMatch[1], url).href;
		}

		return metadata;
	} catch (error) {
		console.warn('Failed to fetch URL metadata:', error);
		return {};
	}
}

function extractMetaTag(html: string, tagName: string): string | null {
	// Handle title tag specially
	if (tagName === 'title') {
		const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
		return titleMatch ? titleMatch[1].trim() : null;
	}

	// Extract meta tag content by property or name
	const propertyMatch = html.match(
		new RegExp(`<meta[^>]+(?:property|name)=["']${tagName}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i')
	);
	if (propertyMatch) {
		return propertyMatch[1];
	}

	// Try alternate order (content before property/name)
	const contentMatch = html.match(
		new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${tagName}["'][^>]*>`, 'i')
	);
	if (contentMatch) {
		return contentMatch[1];
	}

	return null;
}
