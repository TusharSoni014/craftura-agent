import { Lexend_Deca } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/#create", label: "Create" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#about", label: "About" },
] as const;

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  weight: "500",
});

export default function Header() {
  return (
    <header className="fixed top-0  w-full grid h-16 grid-cols-[1fr_auto] items-center border-b border-white/10 bg-[#121212]/80 px-6 backdrop-blur-[10px] md:grid-cols-[1fr_auto_1fr] lg:px-[7.29%]">
      <Link href="/" className="flex items-center gap-1 justify-self-start">
        <Image
          src="/craftura-mark.png"
          alt=""
          width={40}
          height={39}
          priority
          className="size-10 object-contain"
        />
        <span
          className={`${lexendDeca.className} hidden text-xl tracking-[0.12em] sm:inline`}
        >
          craftura
        </span>
      </Link>

      <nav className="hidden items-center gap-8 md:flex">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="text-sm font-medium tracking-[0.06em]"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <Button
        render={<Link href="/agent" />}
        nativeButton={false}
        className="h-10 justify-self-end rounded-full px-5 text-sm font-bold tracking-[0.08em]"
      >
        Get started
      </Button>
    </header>
  );
}
