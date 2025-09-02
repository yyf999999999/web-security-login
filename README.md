# WebSecurityLogin - セキュア認証システム

WebSecPlaygroundをもとに改造した、Next.jsとセッションベース認証を使用したセキュアなウェブアプリケーションです。

## 特徴と機能の説明

### 基本機能
- セッションベース認証システム
- メールアドレス認証
- Role-based認可（記事閲覧制限）

### 追加セキュリティ機能
1. **roleに応じて閲覧できる記事を制限する機能** - 
2. **簡易的なメール認証機能** - 

## セキュリティ対策

- bcryptによるパスワードハッシュ化
- セッション自動期限延長
- XSS対策実装
- CSRF対策（SameSite Cookie）
- CSP設定
- セキュアCookie

## 使用技術

- TypeScript, Next.js 15
- Prisma ORM + SQLite
- Nodemailer (Gmail SMTP)
- bcryptjs, react-hook-form

## 開発期間・体制

- 個人開発
- 開発期間: 12時間以上

## 工夫した点・苦労した点

- 

## 連絡先 (任意)

- [ポートフォリオ](https://yyf999999999.github.io/newPortfolio)
- 大阪公立大学工業高等専門学校
