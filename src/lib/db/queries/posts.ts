import { desc, eq } from "drizzle-orm";
import { db } from "..";
import { feedFollows, posts } from "../schema";

export const createPost = async (
  title: string,
  url: string,
  description: string,
  feedId: string,
  publishedAt: Date
) => {
  const [result] = await db
    .insert(posts)
    .values({ title, url, description, feedId, publishedAt })
    .returning();
  return result;
};

export const getPostsForUser = async (userId: string, limit: number) => {
  console.log(userId, limit);
  const results = await db
    .select({ title: posts.title })
    .from(posts)
    .innerJoin(feedFollows, eq(posts.feedId, feedFollows.feedId))
    .where(eq(feedFollows.userId, userId))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
  return results;
};
