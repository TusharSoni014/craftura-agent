import { ArrowUpIcon, ArrowUpRightIcon } from "lucide-react";
import { Instrument_Serif, Inter } from "next/font/google";
import Link from "next/link";
import { HeroImageGrid } from "@/components/home/hero-image-grid";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import Header from "./header";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

export function HeroSection() {
  return (
    <section
      className={`${inter.className} relative flex min-h-svh flex-col bg-[#121212] text-white`}
    >
      <Header />
      <div
        data-aifx="fluted-glass"
        data-aifx-colors="#000000,#006bff,#00186d,#000000,#002091"
        data-aifx-bg="#000000"
        data-aifx-speed="0.3"
        data-aifx-flutes="39"
        data-aifx-distortion="1.06"
        data-aifx-highlight="1.07"
        data-aifx-blur="2.5"
        data-aifx-angle="245"
        data-aifx-grain="0"
        data-aifx-mouse="0"
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      />

      <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 pt-8 pb-6 lg:flex-row lg:justify-between lg:gap-6 lg:px-[7.29%]">
        <div className="flex max-w-xl flex-col">
          <h1 className="text-[2.25rem] leading-[1.08] font-medium tracking-tight">
            Turn your{" "}
            <em
              className={`${instrumentSerif.className} pr-1.5 text-[2.85rem] text-[#48CAE4]`}
            >
              words
            </em>
            into{" "}
            <span className="text-white/70">visuals, motion and sound.</span>
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-[1.48] tracking-[0.02em] text-white/70">
            Craftura transforms your ideas into stunning visuals, cinematic
            videos, and immersive sound effortlessly.
          </p>
          <Button
            render={<Link href="/agent" />}
            nativeButton={false}
            className="mt-8 h-11 w-fit rounded-full px-5 text-sm font-semibold tracking-[0.08em]"
          >
            Start creating
            <ArrowUpRightIcon data-icon="inline-end" />
          </Button>
        </div>

        <HeroImageGrid className="border border-red-500 hidden h-dvh! w-full shrink-0 lg:block xl:h-120 xl:w-105 2xl:h-140 2xl:w-120" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-linear-to-t from-[#121212] via-[#121212]/80 to-transparent" />

      <form
        action="/agent"
        className="relative z-10 flex justify-center px-6 pb-6"
      >
        <InputGroup className="h-14 w-full max-w-md rounded-full border-white/15 bg-black/35 px-4 shadow-[inset_-10px_-12px_30px_#1e1e1e40,inset_24px_24px_17px_#48cae41a] backdrop-blur-[20px] dark:bg-black/35">
          <InputGroupInput
            name="prompt"
            placeholder="What do you want to create ?"
            className="h-auto text-sm font-medium text-white placeholder:text-white"
          />
          <InputGroupAddon align="inline-end">
            <Button
              type="submit"
              size="icon"
              aria-label="Submit prompt"
              className="size-9 rounded-full bg-linear-to-b from-[#EAA6C3] to-[#6600DA] text-[#1e1e1e] shadow-[inset_0_2.4px_8.28px_#fff] hover:from-[#EAA6C3] hover:to-[#6600DA]"
            >
              <ArrowUpIcon />
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </section>
  );
}
