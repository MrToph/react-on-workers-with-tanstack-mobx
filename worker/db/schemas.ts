import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import type { UserCredential } from "./user";

export const users = sqliteTable("users", {
  username: text("name").notNull().primaryKey(),
  credentials: text("credentials", { mode: "json" })
    .$type<UserCredential[]>()
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});


