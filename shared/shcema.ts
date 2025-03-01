import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// usersテーブルの定義
export const users = pgTable("users", {
  id: serial("id").primaryKey(), // 自動的に1増える主キー
  email: text("email").notNull().unique(), // ユニークかつ必須のメールアドレス
  displayName: text("display_name").notNull(), // 必須の表示名
  password: text("password").notNull(), // 必須のパスワード
  status: text("status").notNull().default("pending"), // デフォルト値が "pending" のステータス
  createdAt: timestamp("created_at").notNull().defaultNow(), // デフォルト値が現在時刻の作成日時
});

// ユーザー登録用のスキーマを定義
export const insertUserSchema = createInsertSchema(users)
  .pick({
    email: true,
    displayName: true,
    password: true,
  })
  .extend({
    // メールアドレスのチェック
    email: z
      .string()
      .email("Eメールアドレスを入力してください")
      .min(1, "Eメールアドレスは必須です"),
    // パスワードのチェック
    password: z
      .string()
      .min(8, "パスワードは最低8文字です")
      .regex(/[A-Z]/, "パスワードには最低一つの大文字が含まれていなければなりません")
      .regex(/[a-z]/, "パスワードには最低一つの小文字が含まれていなければなりません")
      .regex(/[0-9]/, "パスワードには最低一つの数字が含まれていなければなりません")
      .regex(/[^A-Za-z0-9]/, "パスワードには最低一つの特殊文字が含まれていなければなりません"),
    // 表示名のチェック
    displayName: z
      .string()
      .min(2, "表示名は2文字以上でなければなりません")
      .max(50, "表示名は50文字を超えてはいけません"),
  });

// ログイン用のスキーマを定義
export const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"), // メールアドレスのチェック
  password: z.string().min(1, "パスワードは必須です"), // パスワードのチェック
});

// 型定義
export type InsertUser = z.infer<typeof insertUserSchema>; // ユーザー登録データの型
export type LoginData = z.infer<typeof loginSchema>; // ログインデータの型
export type User = typeof users.$inferSelect; // ユーザーテーブルのレコード型