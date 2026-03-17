import { prisma } from '$lib/server/database';
import { redirect } from '@sveltejs/kit';

export const load = async ({ params, url }: { params: { id: string }; url: URL }) => {
	const savedUrl = await prisma.savedUrl.findUnique({
		where: { id: params.id },
		include: {
			blogPosts: {
				orderBy: {
					createdAt: 'desc',
				},
			},
			urlCategories: true,
		},
	});

	if (!savedUrl) {
		throw redirect(302, '/urls');
	}

	// Get form data from URL parameters
	const title = url.searchParams.get('title') || savedUrl.title || '';
	const blogReason = url.searchParams.get('blogReason') || '';
	const tone = url.searchParams.get('tone') || 'Professional';
	const format = url.searchParams.get('format') || 'Tutorial';
	const tags = url.searchParams.get('tags') || '';
	const category = url.searchParams.get('category') || 'Technology';
	const additionalInstructions = url.searchParams.get('additionalInstructions') || '';

	return {
		savedUrl: {
			id: savedUrl.id,
			url: savedUrl.url,
			title: savedUrl.title,
			description: savedUrl.description,
			thumbnail: savedUrl.thumbnail,
			markdownContent: savedUrl.markdownContent,
			createdAt: savedUrl.createdAt,
			categories: savedUrl.urlCategories.map((cat) => ({
				id: cat.id,
				name: cat.name,
				description: cat.description,
			})),
			blogPosts: savedUrl.blogPosts.map((post) => ({
				id: post.id,
				title: post.title,
				content: post.content,
				createdAt: post.createdAt,
			})),
		},
		formData: {
			title,
			blogReason,
			tone,
			format,
			tags: tags ? tags.split(',').filter(Boolean) : [],
			category,
			additionalInstructions,
		},
	};
};
