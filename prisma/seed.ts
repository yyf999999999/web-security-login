// 実行は npx prisma db seed　(package.jsonの prisma にコマンド追加)
// 上記コマンドで実行する範囲は相対パスを基準にする必要があるので注意
// import { v4 as uuid } from "uuid";
import { PrismaClient, Role} from "@prisma/client";
import { UserSeed, userSeedSchema } from "../src/app/_types/UserSeed";
import bcrypt from "bcryptjs";


const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // テスト用のユーザ情報の「種」となる userSeeds を作成
  const userSeeds: UserSeed[] = [
    {
      name: "高負荷 耐子",
      password: "password1111",
      email: "admin01@example.com",
      role: Role.ADMIN,
      emailVerified: true
    },
    {
      name: "不具合 直志",
      password: "password2222",
      email: "admin02@example.com",
      role: Role.ADMIN,
      emailVerified: true
    },
    {
      name: "構文 誤次郎",
      password: "password1111",
      email: "user01@example.com",
      role: Role.USER,
      emailVerified: true,
      aboutSlug: "gojiro",
      aboutContent: "構文誤次郎です。<br>よろしくお願いします。",
    },
    {
      name: "仕様 曖昧子",
      password: "password2222",
      email: "user02@example.com",
      role: Role.USER,
      emailVerified: true,
      aboutSlug: "aimaiko",
      aboutContent: "仕様曖昧子と申します。仲良くしてください。",
    },
  ];

  // userSeedSchema を使って UserSeeds のバリデーション
  try {
    await Promise.all(
      userSeeds.map(async (userSeed, index) => {
        const result = userSeedSchema.safeParse(userSeed);
        if (result.success) return;
        console.error(
          `Validation error in record ${index}:\n${JSON.stringify(userSeed, null, 2)}`,
        );
        console.error("▲▲▲ Validation errors ▲▲▲");
        console.error(
          JSON.stringify(result.error.flatten().fieldErrors, null, 2),
        );
        throw new Error(`Validation failed at record ${index}`);
      }),
    );
  } catch (error) {
    throw error;
  }

  // 各テーブルの全レコードを削除
  await prisma.user.deleteMany();
  await prisma.session.deleteMany();
  await prisma.article.deleteMany();

  const userPasswordPromises = userSeeds.map(
    async (userSeed) => {
      return {
        ...userSeed,
        password: await bcrypt.hash(userSeed.password, 10),
      };
    },
  );

  // ユーザ（user）テーブルにテストデータを挿入
  await prisma.user.createMany({
    data: await Promise.all(userPasswordPromises),
  });

  await prisma.article.createMany({
    data: [
      {
        title: "メモリ増設計画",
        user: "高負荷 耐子",
        permission: 2,
        content: "これは管理者しか読めない記事です。",
        publishedAt: new Date("2025-05-17"),
      },
      {
        title: "windows updateをするとブルースクリーンになる問題",
        user: "不具合 直志",
        permission: 0,
        content: "これは全員が読める記事です。",
        publishedAt: new Date("2025-05-17"),
      },
      {
        title: "pythonのインデント忘れすぎ問題",
        user: "構文 誤次郎",
        permission: 0,
        content: "これは全員が読める記事です。",
        publishedAt: new Date("2025-05-17"),
      },
      {
        title: "i++と++iの違いって何？",
        user: "仕様 曖昧子",
        permission: 1,
        content: "これは管理者とユーザが読める記事です。",
        publishedAt: new Date("2025-05-17"),
      },
    ],
  });
}

main()
  .catch((e) => console.error(e.message))
  .finally(async () => {
    await prisma.$disconnect();
  });
