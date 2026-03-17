import { json } from '@sveltejs/kit';
import { prisma } from '$lib/server/database';
import { z } from 'zod';

const saveBlogPostSchema = z.object({
	savedUrlId: z.string(),
	title: z.string().min(1, 'Title is required'),
	content: z.string().min(1, 'Content is required'),
	tone: z.string().optional().default('Professional'),
	format: z.string().optional().default('Tutorial'),
	tags: z.array(z.string()).optional().default([]),
	category: z.string().optional().default('Technology'),
	blogReason: z.string().optional(),
	additionalInstructions: z.string().optional(),
});

export async function POST({ request }) {
	try {
		const body = await request.json();

		const validation = saveBlogPostSchema.safeParse(body);

		if (!validation.success) {
			return json(
				{ error: validation.error.errors[0]?.message || 'Invalid request data' },
				{ status: 400 }
			);
		}

		const { savedUrlId, title, content, tone, format, tags, category, blogReason, additionalInstructions } = validation.data;

		// Verify the saved URL exists
		const savedUrl = await prisma.savedUrl.findUnique({
			where: { id: savedUrlId },
		});

		if (!savedUrl) {
			return json({ error: 'URL not found' }, { status: 404 });
		}

		// Extract frontmatter from content if present
		const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
		const match = content.match(frontmatterRegex);

		let frontmatterTitle = title;
		let frontmatterTags = tags;
		let frontmatterCategory = category;

		if (match) {
			const frontmatterString = match[1];
			const titleMatch = frontmatterString.match(/title:\s*(.+)/);
			const tagsMatch = frontmatterString.match(/tags:\s*\[(.+?)\]/);
			const categoryMatch = frontmatterString.match(/category:\s*(.+)/);

			if (titleMatch) frontmatterTitle = titleMatch[1].trim();
			if (tagsMatch) {
				frontmatterTags = tagsMatch[1].split(',').map((t) => t.trim());
			}
			if (categoryMatch) frontmatterCategory = categoryMatch[1].trim();
		}

		// Create the blog post in the database
		const blogPost = await prisma.blogPost.create({
			data: {
				savedUrlId,
				title: frontmatterTitle,
				content,
				frontmatter: {
					title: frontmatterTitle,
					tags: frontmatterTags,
					category: frontmatterCategory,
					tone,
					format,
				},
				tone,
				format,
				category: frontmatterCategory,
				tags: frontmatterTags,
				blogReason: blogReason || '',
				additionalInstructions: additionalInstructions || '',
			},
		});

		return json({
			success: true,
			blogPost: {
				id: blogPost.id,
				title: blogPost.title,
				content: blogPost.content,
				createdAt: blogPost.createdAt,
			},
		});
	} catch (error) {
		console.error('Save blog post error:', error);
		return json(
			{ error: 'Failed to save blog post', details: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
}
