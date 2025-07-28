import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "../index";
import { feeds } from "../schema";

export const createFeed = async (name: string, url: string, userId: string) => {
  const [result] = await db
    .insert(feeds)
    .values({ name: name, url: url, userId: userId })
    .returning();
  return result;
};

export const getFeeds = async () => {
  const results = await db.select().from(feeds);
  return results;
};

export const getFeedByUrl = async (url: string) => {
  const [result] = await db.select().from(feeds).where(eq(feeds.url, url));
  return result;
};

export const markFeedFetched = async (feedId: string) => {
  const now = new Date();
  await db
    .update(feeds)
    .set({ lastFetchedAt: now, updatedAt: now })
    .where(eq(feeds.id, feedId));
};

export const getNextFeedToFetch = async () => {
  const [result] = await db
    .select()
    .from(feeds)
    .orderBy(sql`last_fetched_at ASC NULLS FIRST`)
    .limit(1);
  return result;
};
