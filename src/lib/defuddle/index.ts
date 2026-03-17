export const DEFUDDLE_BASE_URL = 'https://defuddle.md';

export async function fetchMarkdown(url: string): Promise<string> {
	const encodedUrl = encodeURIComponent(url);
	const response = await fetch(`${DEFUDDLE_BASE_URL}/${encodedUrl}`, {
		signal: AbortSignal.timeout(30000),
	});

	if (!response.ok) {
		throw new Error(`Defuddle error: ${response.status} ${response.statusText}`);
	}

	return response.text();
}

export interface UrlMetadata {
	title?: string;
	description?: string;
	excerpt?: string;
	thumbnail?: string;
	favicon?: string;
	author?: string;
	siteName?: string;
	publishedDate?: string;
}

export async function fetchUrlMetadata(url: string): Promise<UrlMetadata> {
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
		const metadata: UrlMetadata = {
			title: extractMetaTag(html, 'og:title') || extractMetaTag(html, 'title') || undefined,
			description: extractMetaTag(html, 'og:description') || extractMetaTag(html, 'description') || undefined,
			excerpt: extractMetaTag(html, 'og:description') || undefined,
			thumbnail: extractMetaTag(html, 'og:image') || extractMetaTag(html, 'twitter:image') || undefined,
			favicon: undefined, // Favicon requires parsing link tags or using default
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
