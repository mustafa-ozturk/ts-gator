import { createUser, getUserByName } from "../lib/db/queries/users";
import { setUser } from "../config";

export const handlerLogin = async (cmdName: string, ...args: string[]) => {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const userName = args[0];
  const result = await getUserByName(userName);
  if (!result) {
    throw new Error(`user ${userName} does not exist`);
  }
  setUser(userName);
  console.log(`user: ${args[0]} has been set`);
};

export const handlerRegister = async (cmdName: string, ...args: string[]) => {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const userName = args[0];
  const result = await createUser(userName);
  setUser(userName);
  console.log(
    `user: ${userName} was succesfully created and registered with id ${result.id}`
  );
};
