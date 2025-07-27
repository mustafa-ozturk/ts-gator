import { and, eq } from "drizzle-orm";
import { db } from "../index";
import { feedFollows, feeds, users } from "../schema";

// export const createFeed = async (name: string, url: string, userId: string) => {
//   const [result] = await db
//     .insert(feeds)
//     .values({ name: name, url: url, userId: userId })
//     .returning();
//   return result;
// };

// export const getFeeds = async () => {
//   const results = await db.select().from(feeds);
//   return results;
// };

export const createFeedFollow = async (userId: string, feedId: string) => {
  const [newFeedFollow] = await db
    .insert(feedFollows)
    .values({ userId: userId, feedId: feedId })
    .returning();

  const [result] = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      userId: feedFollows.userId,
      feedId: feedFollows.feedId,
      userName: users.name,
      feedName: feeds.name,
    })
    .from(feedFollows)
    .where(eq(feedFollows.id, newFeedFollow.id))
    .innerJoin(users, eq(users.id, feedFollows.userId))
    .innerJoin(feeds, eq(feeds.id, feedFollows.feedId));

  return result;
};

export const getFeedFollowsForUser = async (userId: string) => {
  const results = await db
    .select({
      id: feedFollows.id,
      createdAt: feedFollows.createdAt,
      updatedAt: feedFollows.updatedAt,
      userId: feedFollows.userId,
      feedId: feedFollows.feedId,
      userName: users.name,
      feedName: feeds.name,
    })
    .from(feedFollows)
    .where(eq(feedFollows.userId, userId))
    .innerJoin(users, eq(users.id, feedFollows.userId))
    .innerJoin(feeds, eq(feeds.id, feedFollows.feedId));
  return results;
};

export const deleteFeedFollow = async (userId: string, feedId: string) => {
  await db
    .delete(feedFollows)
    .where(and(eq(feedFollows.userId, userId), eq(feedFollows.feedId, feedId)));
};
