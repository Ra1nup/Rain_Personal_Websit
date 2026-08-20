import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
	schema: ({ image }) => z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: image().optional(),
		tags: z.array(z.string()).optional(),
	}),
});

const projects = defineCollection({
	schema: ({ image }) => z.object({
		title: z.string(),
		tagline: z.string(),
		category: z.enum(['Web', 'AIGC', 'Tools', 'Mobile']).default('Web'),
		tags: z.array(z.string()).default([]),
		role: z.string().default('Developer'),
		year: z.string().default('2025'),
		status: z.enum(['Live', 'Completed', 'In Progress']).default('Completed'),
		featured: z.boolean().default(false),
		coverImage: image().optional(),
		bannerGradient: z.string().optional(),
		demoUrl: z.string().optional(),
		githubUrl: z.string().optional(),
		order: z.number().default(0),
	}),
});

export const collections = { blog, projects };

