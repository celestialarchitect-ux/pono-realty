import type { MetadataRoute } from 'next';

const SITE_URL = process.env.SITE_URL || 'https://ralphfoulger.com';

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.95 },
  { path: '/free', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/tutor', changeFrequency: 'monthly', priority: 0.85 },
  { path: '/tools', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/course', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/practice', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/quizzes', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/flashcards', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/math', changeFrequency: 'monthly', priority: 0.65 },
  { path: '/glossary', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/free/lesson-1', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/free/lesson-2', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/free/lesson-3', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/free/lesson-4', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/free/lesson-5', changeFrequency: 'monthly', priority: 0.75 },
  { path: '/profile', changeFrequency: 'weekly', priority: 0.5 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return STATIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
