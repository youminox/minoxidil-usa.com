import fs from 'fs';
import path from 'path';

export interface Post {
  slug: string;
  title: string;
  category: string;
  categoryName: string;
  date: string;
  readingTime?: number;
  excerpt: string;
  featuredImage: string;
  content?: string;
}

export interface Category {
  slug: string;
  name: string;
  description?: string;
  count: number;
}

export interface StaticPage {
  slug: string;
  title: string;
  date: string;
  content: string;
}

const contentDir = path.join(process.cwd(), 'content');

let allPostsCache: Post[] | null = null;
let categoriesCache: Category[] | null = null;
let pagesCache: Record<string, StaticPage> | null = null;

export function getAllPosts(): Post[] {
  if (allPostsCache) return allPostsCache;
  const filePath = path.join(contentDir, 'index.json');
  if (fs.existsSync(filePath)) {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    allPostsCache = JSON.parse(fileContents);
    return allPostsCache as Post[];
  }
  return [];
}

export function getPostBySlug(slug: string): Post | null {
  const filePath = path.join(contentDir, 'posts', `${slug}.json`);
  if (fs.existsSync(filePath)) {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  }
  return null;
}

export function getPostsByCategory(category: string): Post[] {
  const allPosts = getAllPosts();
  return allPosts.filter(post => post.category === category);
}

export function getCategories(): Category[] {
  if (categoriesCache) return categoriesCache;
  const filePath = path.join(contentDir, 'categories.json');
  if (fs.existsSync(filePath)) {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    categoriesCache = JSON.parse(fileContents);
    return categoriesCache as Category[];
  }
  return [];
}

export function getRelatedPosts(category: string, currentSlug: string, limit: number = 4): Post[] {
  const categoryPosts = getPostsByCategory(category);
  return categoryPosts
    .filter(post => post.slug !== currentSlug)
    .slice(0, limit);
}

export function getStaticPage(slug: string): StaticPage | null {
  if (!pagesCache) {
    const filePath = path.join(contentDir, 'pages.json');
    if (fs.existsSync(filePath)) {
      pagesCache = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
      pagesCache = {};
    }
  }
  return pagesCache?.[slug] || null;
}
