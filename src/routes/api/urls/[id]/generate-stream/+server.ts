import { json, error } from '@sveltejs/kit';
import { prisma } from '$lib/server/database';
import { llmClient } from '$lib/llm-gateway';
import { z } from 'zod';

console.log('generate-stream API endpoint loaded');

const blogGenerationSchema = z.object({
	savedUrlId: z.string(),
	title: z.string().min(1, 'Title is required'),
	blogReason: z.string().min(1, 'Blog reason is required'),
	tone: z.string().optional().default('Professional'),
	format: z.string().optional().default('Tutorial'),
	tags: z.array(z.string()).optional().default([]),
	category: z.string().optional().default('Technology'),
	additionalInstructions: z.string().nullable().optional().default(''),
	existingContent: z.string().nullable().optional(),
});

export async function POST({ params, request }) {
	console.log('POST request received for generate-stream');
	console.log('params:', params);



	const formData = await request.formData();
	console.log('FormData received:', {
		savedUrlId: formData.get('savedUrlId'),
		title: formData.get('title'),
		blogReason: formData.get('blogReason'),
	});

	const savedUrlId = formData.get('savedUrlId') as string;
	const title = formData.get('title') as string;
	const blogReason = formData.get('blogReason') as string;
	const tone = formData.get('tone') as string;
	const format = formData.get('format') as string;
	const tags = (formData.get('tags') as string)?.split(',').map((t) => t.trim()).filter(Boolean);
	const category = formData.get('category') as string;
	const additionalInstructions = formData.get('additionalInstructions') as string | null;
	const existingContent = formData.get('existingContent') as string | null;

	const validation = blogGenerationSchema.safeParse({
		savedUrlId,
		title,
		blogReason,
		tone,
		format,
		tags,
		category,
		additionalInstructions: additionalInstructions || undefined,
		existingContent: existingContent || undefined,
	});

	if (!validation.success) {
		console.error('Validation failed:', validation.error.errors);
		return json(
			{ error: validation.error.errors[0]?.message || 'Invalid form data' },
			{ status: 400 }
		);
	}

	console.log('Validation passed, looking up savedUrl:', savedUrlId);

	try {
		const savedUrl = await prisma.savedUrl.findUnique({
			where: { id: savedUrlId },
		});

		if (!savedUrl) {
			console.error('SavedUrl not found:', savedUrlId);
			return json({ error: 'URL not found' }, { status: 404 });
		}

		console.log('SavedUrl found:', savedUrl.url);
		console.log('Starting LLM stream generation...');

		console.log('Calling LLM gateway with options:', {
			url: savedUrl.url,
			title,
			blogReason,
			tone,
			format,
			tags,
			category,
		});

		const stream = llmClient.generateBlogPostStream({
			url: savedUrl.url,
			title,
			blogReason,
			tone,
			format,
			tags,
			category,
			additionalInstructions,
			existingContent: existingContent || undefined,
		});

		console.log('Stream created, setting up ReadableStream...');

		const encoder = new TextEncoder();
		const readableStream = new ReadableStream({
			async start(controller) {
				try {
					let chunkCount = 0;
					for await (const chunk of stream) {
						chunkCount++;
						if (chunkCount === 1) {
							console.log('First chunk received:', chunk.substring(0, 50));
						}
						controller.enqueue(encoder.encode(chunk));
					}
					console.log(`Stream completed. Total chunks: ${chunkCount}`);
					controller.close();
				} catch (err) {
					console.error('Stream error:', err);
					controller.error(err);
				}
			},
		});

		return new Response(readableStream, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'no-cache',
				'Transfer-Encoding': 'chunked',
			},
		});
	} catch (err) {
		console.error('Stream generation error:', err);
		console.error('Error stack:', err instanceof Error ? err.stack : 'No stack trace');
		if (err instanceof Error && err.message.includes('timeout')) {
			return json({ error: 'Generation timed out. Please retry.' }, { status: 408 });
		}
		return json({
			error: 'Failed to generate blog post',
			details: err instanceof Error ? err.message : 'Unknown error'
		}, { status: 500 });
	}
}
