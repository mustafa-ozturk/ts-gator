import { eq } from "drizzle-orm";
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
