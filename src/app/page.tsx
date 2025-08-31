import NextLink from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCode } from "@fortawesome/free-solid-svg-icons";

const links = [
  {
    href: "/article",
    label: "記事",
    info: "利用者の区別",
  },
  {
    href: "/login",
    label: "ログイン",
    info: "セッションベース認証入門",
  },
  {
    href: "/signup",
    label: "サインアップ",
    info: "ServerActions (Custom Invocation) 入門",
  },
];

const Page: React.FC = () => {
  return (
    <main>
      <div className="font-bold text-2xl">Main</div>
      <div className="mt-4 ml-2 gap-y-2">
        {links.map(({ href, label, info }) => (
          <div key={href} className="flex items-center">
            <FontAwesomeIcon icon={faCode} className="mr-1.5" />
            <NextLink href={href} className="mr-2 hover:underline">
              {label}
            </NextLink>
            <div className="text-xs text-slate-600">※ {info}</div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Page;