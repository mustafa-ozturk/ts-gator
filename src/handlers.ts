import { setUser } from "./config";

export const handlerLogin = (cmdName: string, ...args: string[]) => {
  if (args.length !== 0) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const userName = args[0];
  setUser(userName);
  console.log(`user: ${args[0]} has been set`);
};
