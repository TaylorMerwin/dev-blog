import { PostPreview} from './types';
import { getPostPreviews } from './database';

interface PostCache {
  posts: PostPreview[];
  lastUpdated: Date | null;
  cacheLimit: number;
}

const postCache: PostCache = {
  posts: [],
  lastUpdated: null,
  cacheLimit: 100,
};

// Assuming getPostsWithAuthor returns a Promise of Post[]
export async function updateCache(): Promise<void> {
  try {
    const recentPosts = await getPostPreviews(postCache.cacheLimit, 10);
    postCache.posts = recentPosts;
    postCache.lastUpdated = new Date();
    console.log('Post cache updated');
  } catch (error) {
    console.error('Failed to update post cache:', error);
  }
}

export function getCachedPosts(): PostPreview[] {
  return postCache.posts;
}

export function isCacheStale(): boolean {
  const now = new Date();
  const maxAge = 10 * 60 * 1000; // 10 minutes
  return postCache.lastUpdated === null || now.getTime() - postCache.lastUpdated.getTime() > maxAge;
}