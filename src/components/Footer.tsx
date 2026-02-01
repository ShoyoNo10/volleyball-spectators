import Link from "next/link";
import { Newspaper } from 'lucide-react';
import { TvMinimalPlay } from 'lucide-react';
import { Wallet } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="fixed bottom-0 w-full bg-black text-white flex justify-around py-2 md:hidden">
      <Link href="/news" className="flex gap-1 items-center"> <Newspaper/>Нүүр хуудас</Link>
      <Link href="/live" className="flex gap-1 items-center"><TvMinimalPlay/>Live</Link>
      <Link href="/packages" className="flex gap-1 items-center"><Wallet/>Багц</Link>
    </footer>
  );
}
