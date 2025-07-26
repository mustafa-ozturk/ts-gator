import {
  createUser,
  deleteUsers,
  getUserByName,
  getUsers,
} from "../lib/db/queries/users";
import { readConfig, setUser } from "../config";

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

export const handlerReset = async (cmdName: string, ...args: string[]) => {
  try {
    await deleteUsers();
    console.log("succesfully deleted all users");
  } catch (error) {
    console.log("couldn't delete all users:");
    console.log(error);
  }
};

export const handlerUsers = async (cmdName: string, ...args: string[]) => {
  const config = readConfig();
  const users = await getUsers();

  for (const user of users) {
    const isCurrent = config.currentUserName === user.name;
    console.log(` * ${user.name}${isCurrent ? " (current)" : ""}`);
  }
};
