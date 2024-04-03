"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCacheStale = exports.getCachedPosts = exports.updateCache = void 0;
const postModel_1 = require("../models/postModel");
const postCache = {
    posts: [],
    lastUpdated: null,
    cacheLimit: 100,
};
// Assuming getPostsWithAuthor returns a Promise of Post[]
async function updateCache() {
    try {
        const recentPosts = await (0, postModel_1.getPostPreviews)(postCache.cacheLimit, 10);
        postCache.posts = recentPosts;
        postCache.lastUpdated = new Date();
    }
    catch (error) {
        console.error("Failed to update post cache:", error);
    }
}
exports.updateCache = updateCache;
function getCachedPosts() {
    return postCache.posts;
}
exports.getCachedPosts = getCachedPosts;
function isCacheStale() {
    const now = new Date();
    const maxAge = 10 * 60 * 1000; // 10 minutes
    return (postCache.lastUpdated === null ||
        now.getTime() - postCache.lastUpdated.getTime() > maxAge);
}
exports.isCacheStale = isCacheStale;
