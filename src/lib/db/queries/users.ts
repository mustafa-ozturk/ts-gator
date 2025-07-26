import { eq } from "drizzle-orm";
import { db } from "../index";
import { users } from "../schema";

export const createUser = async (name: string) => {
  // drizzle returns an array of results even if there is one result
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
};

export const getUserByName = async (name: string) => {
  const [result] = await db.select().from(users).where(eq(users.name, name));
  return result;
};

export const getUserById = async (id: string) => {
  const [result] = await db.select().from(users).where(eq(users.id, id));
  return result;
};

export const deleteUsers = async () => {
  await db.delete(users);
};

export const getUsers = async () => {
  const result = await db.select().from(users);
  return result;
};
