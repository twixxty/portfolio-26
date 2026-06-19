import { defineCollection, z, image } from 'astro:content';

const projects = defineCollection({
  type: 'data',
  schema: ({ image }) => z.object({
    href: z.string().url(),
    image: image(),
    imageAlt: z.string(),
    video: z.string(),
    index: z.enum(['wd', 'ex']),
    date: z.string(),
    title: z.string(),
    desc: z.string(),
    statNum: z.string(),
    statLabel: z.string(),
    order: z.number(),
  }),
});

const faqs = defineCollection({
  type: 'data',
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    order: z.number(),
  }),
});

const testimonials = defineCollection({
  type: 'data',
  
  
  
  
  schema: z.object({
    quote: z.string(),
    quoteWoke: z.string().optional(),
    name: z.string(),
    company: z.string(),
    avatar: z.string(),
    duration: z.number(),
    order: z.number(),
  }),
});

export const collections = { projects, faqs, testimonials };
