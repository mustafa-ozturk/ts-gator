import { pgTable, timestamp, uuid, text } from "drizzle-orm/pg-core";

// the $onUpdate functions sets the updatedAt field to a default value whenever the is updated
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  name: text("name").notNull().unique(),
});
