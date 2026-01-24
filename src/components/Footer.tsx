import Link from "next/link";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 w-full bg-black text-white flex justify-around py-2 md:hidden">
      <Link href="/news">📰 News</Link>
      <Link href="/live">▶ Live</Link>
      <Link href="/packages">📦 Багц</Link>
    </footer>
  );
}
