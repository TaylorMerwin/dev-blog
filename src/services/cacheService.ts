import { PostPreview } from "../interfaces/types";
import { getPostPreviews } from "../models/postModel";
import { testConnection } from "../models/database";

interface PostCache {
  posts: PostPreview[];
  lastUpdated: Date | null;
  cacheLimit: number;
  isConnected: boolean;
}

const postCache: PostCache = {
  posts: [],
  lastUpdated: null,
  cacheLimit: 100,
  isConnected: false,
};

async function checkConnection(): Promise<boolean> {
  try {
    await testConnection();
    postCache.isConnected = true;
    return true;
  } catch (error) {
    postCache.isConnected = false;
    return false;
  }
}

export async function updateCache(): Promise<void> {
  try {
    // Check connection first
    if (!postCache.isConnected) {
      await checkConnection();
    }
    if (!postCache.isConnected) {
      console.log("Database connection not available - using existing cache");
      return;
    }

    const recentPosts = await getPostPreviews(postCache.cacheLimit, 10);
    postCache.posts = recentPosts || [];
    postCache.lastUpdated = new Date();
  } catch (error) {
    console.error("Failed to update post cache:", error);
    if (!postCache.posts.length) {
      postCache.posts = [];
    }
    postCache.lastUpdated = new Date();
  }
}

export function getCachedPosts(): PostPreview[] {
  return postCache.posts;
}

export function isCacheStale(): boolean {
  const now = new Date();
  const maxAge = 10 * 60 * 1000; // 10 minutes
  return (
    postCache.lastUpdated === null ||
    now.getTime() - postCache.lastUpdated.getTime() > maxAge
  );
}
