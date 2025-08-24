import { sql, relations } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).notNull().unique(),
  email: varchar("email").unique(),
  password: varchar("password").notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  followersCount: integer("followers_count").default(0),
  followingCount: integer("following_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);

export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  imageUrl: varchar("image_url"),
  cookTime: varchar("cook_time"),
  servings: varchar("servings"),
  difficulty: difficultyEnum("difficulty").default("easy"),
  ingredients: text("ingredients").notNull(),
  instructions: text("instructions").notNull(),
  creatorId: varchar("creator_id").references(() => users.id).notNull(),
  likesCount: integer("likes_count").default(0),
  savesCount: integer("saves_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const recipeInteractions = pgTable("recipe_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  recipeId: varchar("recipe_id").references(() => recipes.id).notNull(),
  liked: boolean("liked").notNull(),
  superLiked: boolean("super_liked").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const savedRecipes = pgTable("saved_recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  recipeId: varchar("recipe_id").references(() => recipes.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userFollows = pgTable("user_follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").references(() => users.id).notNull(),
  followingId: varchar("following_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  recipes: many(recipes),
  interactions: many(recipeInteractions),
  savedRecipes: many(savedRecipes),
  following: many(userFollows, { relationName: "follower" }),
  followers: many(userFollows, { relationName: "following" }),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  creator: one(users, {
    fields: [recipes.creatorId],
    references: [users.id],
  }),
  interactions: many(recipeInteractions),
  saves: many(savedRecipes),
}));

export const recipeInteractionsRelations = relations(recipeInteractions, ({ one }) => ({
  user: one(users, {
    fields: [recipeInteractions.userId],
    references: [users.id],
  }),
  recipe: one(recipes, {
    fields: [recipeInteractions.recipeId],
    references: [recipes.id],
  }),
}));

export const savedRecipesRelations = relations(savedRecipes, ({ one }) => ({
  user: one(users, {
    fields: [savedRecipes.userId],
    references: [users.id],
  }),
  recipe: one(recipes, {
    fields: [savedRecipes.recipeId],
    references: [recipes.id],
  }),
}));

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [userFollows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  creatorId: true,
  likesCount: true,
  savesCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRecipeInteractionSchema = createInsertSchema(recipeInteractions).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertSavedRecipeSchema = createInsertSchema(savedRecipes).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertUserFollowSchema = createInsertSchema(userFollows).omit({
  id: true,
  followerId: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  followersCount: true,
  followingCount: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").max(50),
});

export const loginUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type RecipeInteraction = typeof recipeInteractions.$inferSelect;
export type InsertRecipeInteraction = z.infer<typeof insertRecipeInteractionSchema>;
export type SavedRecipe = typeof savedRecipes.$inferSelect;
export type InsertSavedRecipe = z.infer<typeof insertSavedRecipeSchema>;
export type UserFollow = typeof userFollows.$inferSelect;
export type InsertUserFollow = z.infer<typeof insertUserFollowSchema>;

export type RecipeWithCreator = Recipe & {
  creator: User;
};

export type UserWithCounts = User & {
  recipesCount?: number;
  isFollowing?: boolean;
};
