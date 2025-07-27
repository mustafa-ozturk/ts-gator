import { XMLParser } from "fast-xml-parser";
import { readConfig } from "src/config";
import {
  createFeedFollow,
  getFeedFollowsForUser,
} from "src/lib/db/queries/feed_follows";
import { createFeed, getFeedByUrl, getFeeds } from "src/lib/db/queries/feeds";
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

export const handlerAgg = async (cmdName: string, ...args: string[]) => {
  const result = await fetchFeed("https://www.wagslane.dev/index.xml");
  console.log(result);
};

export const handlerAddFeed = async (cmdName: string, ...args: string[]) => {
  if (args.length !== 2) {
    throw new Error(`usage: ${cmdName} <name> <url>`);
  }

  const { currentUserName } = readConfig();
  const user = await getUserByName(currentUserName);
  const feed = await fetchFeed(args[1]);

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

export const handlerFollow = async (cmdName: string, ...args: string[]) => {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <url>`);
  }

  const { currentUserName } = readConfig();
  const user = await getUserByName(currentUserName);
  const feed = await getFeedByUrl(args[0]);
  if (!feed) {
    throw new Error(`feed not found`);
  }

  const feedFollows = await createFeedFollow(user.id, feed.id);

  console.log(
    `feedFollow record created with user name: ${feedFollows.userName} and feed name: ${feedFollows.feedName}`
  );
};

export const handlerFollowing = async (cmdName: string, ...args: string[]) => {
  const { currentUserName } = readConfig();
  const user = await getUserByName(currentUserName);
  const feeds = await getFeedFollowsForUser(user.id);
  for (const feed of feeds) {
    console.log(`
${user.name} is following feeds:
- ${feed.feedName}
`);
  }
};
