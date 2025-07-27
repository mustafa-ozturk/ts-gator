import { CommandHandler } from "./commands/commands";
import { readConfig } from "./config";
import { getUserByName } from "./lib/db/queries/users";
import { User } from "./lib/db/schema";

type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

type middlewareLoggedIn = (handler: UserCommandHandler) => CommandHandler;

export const middlewareLoggedIn = (handler: UserCommandHandler) => {
  return async (cmdName: string, ...args: string[]) => {
    const { currentUserName } = readConfig();
    const user = await getUserByName(currentUserName);
    if (!user) {
      throw new Error(`User ${currentUserName} not found`);
    }
    return handler(cmdName, user, ...args);
  };
};
