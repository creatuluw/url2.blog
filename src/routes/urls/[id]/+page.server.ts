import { prisma } from '$lib/server/database';
import { fail, error } from '@sveltejs/kit';

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

	const allCategories = await prisma.urlCategory.findMany({
		orderBy: { name: 'asc' },
	});

	if (!savedUrl) {
		throw error(404, 'URL not found');
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
		allCategories: allCategories.map((cat) => ({
			id: cat.id,
			name: cat.name,
			description: cat.description,
		})),
	};
};

export const actions = {
	saveBlogPost: async ({ request }: { request: Request }) => {
		const formData = await request.formData();
		const blogPostId = formData.get('blogPostId') as string;
		const content = formData.get('content') as string;
		const title = formData.get('title') as string;

		if (!content || !title) {
			return fail(400, {
				error: 'Content and title are required',
			});
		}

		try {
			const updated = await prisma.blogPost.update({
				where: { id: blogPostId },
				data: {
					content,
					title,
				},
			});

			return {
				type: 'success' as const,
				data: {
					id: updated.id,
					content: updated.content,
					title: updated.title,
				},
				message: 'Blog post saved successfully',
			};
		} catch (error) {
			console.error('Save error:', error);
			return fail(500, {
				error: 'Unable to save changes. Please retry.',
			});
		}
	},

	searchCategories: async ({ request }: { request: Request }) => {
		const formData = await request.formData();
		const query = formData.get('query') as string;

		if (!query || query.length < 2) {
			return {
				type: 'success' as const,
				data: [],
			};
		}

		try {
			const categories = await prisma.urlCategory.findMany({
				where: {
					name: {
						contains: query,
						mode: 'insensitive',
					},
				},
				orderBy: { name: 'asc' },
				take: 10,
			});

			return {
				type: 'success' as const,
				data: categories.map((cat) => ({
					id: cat.id,
					name: cat.name,
					description: cat.description,
				})),
			};
		} catch (error) {
			console.error('Search error:', error);
			return fail(500, {
				error: 'Unable to search categories. Please retry.',
			});
		}
	},

	createCategory: async ({ request }: { request: Request }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const description = formData.get('description') as string;
		const savedUrlId = formData.get('savedUrlId') as string;

		if (!name) {
			return fail(400, {
				error: 'Category name is required',
			});
		}

		try {
			const existingCategory = await prisma.urlCategory.findFirst({
				where: {
					name: {
						equals: name,
						mode: 'insensitive',
					},
				},
			});

			if (existingCategory) {
				await prisma.savedUrl.update({
					where: { id: savedUrlId },
					data: {
						urlCategories: {
							connect: { id: existingCategory.id },
						},
					},
				});

				return {
					type: 'success' as const,
					data: {
						id: existingCategory.id,
						name: existingCategory.name,
						description: existingCategory.description,
					},
					message: 'Category assigned successfully',
				};
			}

			const newCategory = await prisma.urlCategory.create({
				data: {
					name,
					description: description || '',
				},
			});

			await prisma.savedUrl.update({
				where: { id: savedUrlId },
				data: {
					urlCategories: {
						connect: { id: newCategory.id },
					},
				},
			});

			return {
				type: 'success' as const,
				data: {
					id: newCategory.id,
					name: newCategory.name,
					description: newCategory.description,
				},
				message: 'Category created and assigned successfully',
			};
		} catch (error) {
			console.error('Create error:', error);
			return fail(500, {
				error: 'Unable to create category. Please retry.',
			});
		}
	},

	assignCategory: async ({ request }: { request: Request }) => {
		const formData = await request.formData();
		const categoryId = formData.get('categoryId') as string;
		const savedUrlId = formData.get('savedUrlId') as string;
		const action = formData.get('action') as 'connect' | 'disconnect';

		if (!categoryId || !savedUrlId) {
			return fail(400, {
				error: 'Category ID and URL ID are required',
			});
		}

		try {
			await prisma.savedUrl.update({
				where: { id: savedUrlId },
				data: {
					urlCategories: {
						[action]: { id: categoryId },
					},
				},
			});

			return {
				type: 'success' as const,
				message: action === 'connect' ? 'Category assigned' : 'Category removed',
			};
		} catch (error) {
			console.error('Assign error:', error);
			return fail(500, {
				error: 'Unable to assign category. Please retry.',
			});
		}
	},

	getRecentCategories: async () => {
		try {
			const ninetyDaysAgo = new Date();
			ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

			// Get blog posts from last 90 days
			const recentBlogPosts = await prisma.blogPost.findMany({
				where: {
					createdAt: {
						gte: ninetyDaysAgo,
					},
				},
				include: {
					savedUrl: {
						include: {
							urlCategories: true,
						},
					},
				},
			});

			// Count category usage
			const categoryCount = new Map<string, { category: any; count: number }>();
			for (const post of recentBlogPosts) {
				for (const category of post.savedUrl.urlCategories) {
					const existing = categoryCount.get(category.id);
					if (existing) {
						existing.count++;
					} else {
						categoryCount.set(category.id, { category, count: 1 });
					}
				}
			}

			// If no recent posts, fall back to all categories
			if (categoryCount.size === 0) {
				const allCategories = await prisma.urlCategory.findMany({
					orderBy: { name: 'asc' },
					take: 10,
				});
				const sorted = allCategories.map(cat => ({
					id: cat.id,
					name: cat.name,
					description: cat.description,
				}));

				return {
					type: 'success' as const,
					data: sorted,
				};
			}

			// Sort by count and take top 10
			const sorted = Array.from(categoryCount.values())
				.sort((a, b) => b.count - a.count)
				.slice(0, 10)
				.map(item => ({
					id: item.category.id,
					name: item.category.name,
					description: item.category.description,
					count: item.count,
				}));

			return {
				type: 'success' as const,
				data: sorted,
			};
		} catch (error) {
			console.error('Recent categories error:', error);
			return fail(500, {
				error: 'Unable to get recent categories. Please retry.',
			});
		}
	},
};
