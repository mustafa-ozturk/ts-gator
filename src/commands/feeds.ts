import { XMLParser } from "fast-xml-parser";
import { readConfig } from "src/config";
import {
  createFeedFollow,
  deleteFeedFollow,
  getFeedFollowsForUser,
} from "src/lib/db/queries/feed_follows";
import {
  createFeed,
  getFeedByUrl,
  getFeeds,
  getNextFeedToFetch,
  markFeedFetched,
} from "src/lib/db/queries/feeds";
import { getUserById, getUserByName } from "src/lib/db/queries/users";
import { Feed, User } from "src/lib/db/schema";

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export const fetchFeed = async (feedURL: string) => {
  const resp = await fetch(feedURL, {
    headers: {
      "User-Agent": "gator",
    },
  });

  const xmlText = await resp.text();
  const parser = new XMLParser();

  const { rss } = parser.parse(xmlText);
  if (!rss.channel) {
    throw new Error(`${feedURL} does not have a channel`);
  }

  let { title, link, description, item } = rss.channel;

  if (!title) {
    throw new Error(`${feedURL} does not have a title`);
  }
  if (!link) {
    throw new Error(`${feedURL} does not have a link`);
  }
  if (!description) {
    throw new Error(`${feedURL} does not have a description`);
  }

  if (!Array.isArray(item)) {
    item = [];
  }

  const cleanedItems = [];

  for (const { title, link, description, pubDate } of item) {
    if (!title || !link || !description || !pubDate) {
      continue;
    }
    cleanedItems.push({ title, link, description, pubDate });
  }

  return {
    title,
    link,
    description,
    items: cleanedItems,
  };
};

export const parseDuration = (durationStr: string): number => {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);
  if (!match) {
    throw new Error("regex doesn't match");
  }
  const num = Number(match[1]);
  if (match[2] === "s") {
    return num * 1000;
  }
  if (match[2] === "m") {
    return num * 60 * 1000;
  }
  if (match[2] === "h") {
    return num * 60 * 60 * 1000;
  }
  return num;
};

export const handlerAgg = async (cmdName: string, ...args: string[]) => {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <time_between_reqs>`);
  }
  console.log(`Collecting feeds every ${args[0]}`);
  const durationMs = parseDuration(args[0]);

  // scrapeFeeds().catch((e) => console.log(e));
  const interval = setInterval(() => {
    scrapeFeeds().catch((e) => console.log(e));
  }, durationMs);

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("shutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
};

export const handlerAddFeed = async (
  cmdName: string,
  user: User,
  ...args: string[]
) => {
  if (args.length !== 2) {
    throw new Error(`usage: ${cmdName} <name> <url>`);
  }

  const result = await createFeed(args[0], args[1], user.id);
  printFeed(result, user);
  console.log(`feed succesfully created with ${result.id}`);

  const feedFollows = await createFeedFollow(user.id, result.id);

  console.log(
    `feedFollow record created with user name: ${feedFollows.userName} and feed name: ${feedFollows.feedName}`
  );
};

export const printFeed = (feed: Feed, user: User) => {
  console.log("feed", feed);
  console.log("user", user);
};

export const handlerFeeds = async (cmdName: string, ...args: string[]) => {
  const feeds = await getFeeds();
  for (const feed of feeds) {
    const user = await getUserById(feed.userId);
    console.log(`
- name: ${feed.name} 
- url:  ${feed.url}
- username: ${user.name}
`);
  }
};

export const handlerFollow = async (
  cmdName: string,
  user: User,
  ...args: string[]
) => {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <url>`);
  }

  const feed = await getFeedByUrl(args[0]);
  if (!feed) {
    throw new Error(`feed not found`);
  }

  const feedFollows = await createFeedFollow(user.id, feed.id);

  console.log(
    `feedFollow record created with user name: ${feedFollows.userName} and feed name: ${feedFollows.feedName}`
  );
};

export const handlerFollowing = async (
  cmdName: string,
  user: User,
  ...args: string[]
) => {
  const feeds = await getFeedFollowsForUser(user.id);
  for (const feed of feeds) {
    console.log(`
${user.name} is following feeds:
- ${feed.feedName}
`);
  }
};

export const handlerUnfollow = async (
  cmdName: string,
  user: User,
  ...args: string[]
) => {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <url>`);
  }
  const feed = await getFeedByUrl(args[0]);
  if (!feed) {
    throw new Error(`feed not found`);
  }

  await deleteFeedFollow(user.id, feed.id);
  console.log("deleted feed follow!");
};

export const scrapeFeeds = async () => {
  try {
    const nextFeedToFetch = await getNextFeedToFetch();
    markFeedFetched(nextFeedToFetch.id);
    const feed = await fetchFeed(nextFeedToFetch.url);
    console.log(`==========`);
    console.log(`- ${feed.title}`);
    console.log(`- ${feed.description}`);
    console.log(`-----`);
    for (const item of feed.items) {
      console.log(`- ${item.title}`);
    }
    console.log(`==========`);
  } catch (error) {
    console.log(`Failed to scrape feeds:`, error);
  }
};
