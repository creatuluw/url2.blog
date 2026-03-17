import { prisma } from '$lib/server/database';
import { redirect } from '@sveltejs/kit';

export const load = async ({ params }: { params: { id: string } }) => {
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
	};
};
