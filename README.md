# WebSecurityLogin

- Next.jsとセッションベース認証を使用したセキュアなウェブアプリケーションです。
- web-sec-playgroundをもとに、記事閲覧制限機能やメール認証システムを追加しました。
- アプリURL: (https://web-security-login-nu.vercel.app/)

## 実装機能

### 基本認証機能
web-sec-playgroundからあった標準的な機能です。
- **セッションベース認証** - セキュアなCookie管理
- **ユーザー登録・ログイン** - バリデーション付きフォーム
- **自動セッション延長** - アクティビティに応じた期限更新

### 追加認証・認可機能

#### 1. Role-based記事閲覧制限
ユーザー権限に応じた記事アクセス制御を実装しました。一覧ではpermissionレベルに応じて色分けもされます。(レベル0: 黒, レベル1: 青, レベル2: 赤)
- **未ログイン**: permission 0（公開記事）のみ閲覧
- **一般ユーザー**: permission 1まで閲覧可能  
- **管理者**: 全記事（permission 2まで）閲覧可能

![管理者アカウントから見た記事一覧](images/articles.png)

**実装したコードのパス:**
- `src/app/article/page.tsx`
- `src/app/api/article/[id]/route.ts`

#### 2. メール認証システム
Gmail SMTPを使用した本人確認機能を実装しました。私の個人アカウントからメールを出しているため、いたずらに認証を繰り返すのはやめるようお願いします。
- 6桁認証コードの自動生成・送信
- 10分間の有効期限管理
- 認証完了までログイン制限
- 認証コード再送信機能

![メール認証画面](images/mailCert.png)

**実装したコードのパス:**
- `src/app/verify-email/page.tsx`
- `src/app/signup/page.tsx`
- `src/app/api/verify-email/route.ts`  ← 修正
- `src/app/api/resend-code/route.ts`
- `src/libs/emailService.ts`
- `src/app/_types/EmailVerification.ts`
- `src/app/_actions/signup.ts`

## セキュリティ対策
授業や個人で実装したセキュリティ機能です。

- **パスワードハッシュ化** - bcrypt（ソルトラウンド10）でパスワードを安全に保存
- **CSP設定** - next.config.ts で Content Security Policy を実装、XSS攻撃を防止  
- **セキュアCookie** - HttpOnly, SameSite: strict 設定でセッションハイジャック防止
- **XSS対策** - URLパラメータのサニタイゼーション処理を実装
- **CSRF対策** - SameSite Cookie による不正なリクエスト防止
- **セッション管理** - アクティビティに応じた自動期限延長と無効セッション削除

```typescript
// CSP設定（next.config.ts）
headers: [{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "connect-src 'self'",
  ].join('; '),
}]
```

```typescript
// XSS対策サニタイズ
const sanitizedName = rawName.replace(/<[^>]*>/g, '').slice(0, 50);
```

## 技術構成
- Frontend: Next.js 15, TypeScript, Tailwind CSS
- Backend: Next.js API Routes, Prisma ORM
- Database: SQLite
- Authentication: Session-based (セキュアCookie)
- Email: Nodemailer + Gmail SMTP
- Security: bcryptjs, CSP, XSS対策
- Validation: Zod, react-hook-form

## システム架構
src/app/
├── api/                 # API Routes
│   ├── auth/           # 認証状態確認  
│   ├── login/          # ログイン処理
│   ├── verify-email/   # メール認証
│   └── _helper/        # セッション管理
├── _components/        # 再利用コンポーネント
├── _types/            # TypeScript型定義
└── article/           # 記事閲覧（権限制御）

## 工夫した点・苦労した点

- 権限制御の堅牢性: 記事は一覧からなくすだけでなく、URLを直接知っていても閲覧できないようにサーバーサイドで制御しました。
- メール認証のセキュリティ: 認証コードに有効期限を設け、使用済みコードを自動削除することでセキュリティを向上させました。
- 認証方式の検証: どのファイルがセッションベース認証でどのファイルがトークンベース認証なのか検証するのが大変でした。
- Gmail設定: Gmailでアプリパスワードを設定する項目がなかなか見つからず苦労しました
![権限が無いユーザーがアクセスした場合](images/nothingAuth.png)

## テスト用データ
- ADMIN: admin01@example.com / password1111, admin02@example.com / password2222
- USER:  user01@example.com / password1111, user02@example.com / password2222

## 開発期間・体制

- 開発体制: 個人開発
- 開発期間: 約12時間
- 主要学習項目: セッションベース認証設計、CSP設定、Role-based認可

## 連絡先 (任意)

- [ポートフォリオ](https://yyf999999999.github.io/newPortfolio)
- 大阪公立大学工業高等専門学校
