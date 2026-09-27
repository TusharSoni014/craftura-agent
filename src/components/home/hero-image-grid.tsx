"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { cn } from "cn";

const HERO_GRID_IMAGES = [
  "/hero-grid/04403f0883bd402ba5faf16168a77343d617b575.png",
  "/hero-grid/43c3547a46431b8165e35bd4eb1a4dff12bc4a1a.png",
  "/hero-grid/9b10bdcd56067b9e73927d5b71ab4d02d3697fb7.png",
  "/hero-grid/4ef9ef119922a81004678aabd8ec3fcf756846d8.png",
  "/hero-grid/a7132d823aed785807b7c7bb2b0fd17192b53938.png",
  "/hero-grid/6c05657e1e4cd41886167c4adb23a03bbd60836a.png",
  "/hero-grid/09592918ff072594d42d9f06d31f04286bd301f6.png",
  "/hero-grid/77486a312b2b944b14bb777b32c0f003864545f5.png",
  "/hero-grid/6c13f5cb9153501e93f56d7373737648e53a30eb.png",
  "/hero-grid/b42b023191a2c01742ae55162249a8b33403a68c.png",
  "/hero-grid/ec2feffe74e0092c2c53abb124c8d86d8b8202e6.png",
  "/hero-grid/9240187facf74dd273e037d1af80a5b4c7d5af78.png",
  "/hero-grid/5eed02088f9fe283ce3304a8e56d84e45f54e5f3.png",
  "/hero-grid/550f3765b5db147187b64dc26060f6f64863a568.png",
  "/hero-grid/2c549264dff70e6c97f57101655c1392bf6f009b.png",
  "/hero-grid/c9ae09335323594bd67f799043d052d7c00b8837.png",
  "/hero-grid/ff80e1824b8d068e7a6cef8996baee1be175dce7.png",
  "/hero-grid/f4172a23332683bff6e388544327763f624abcd1.png",
  "/hero-grid/4c40fbdf91246e9e67702e2a019a9b39197e76ee.png",
  "/hero-grid/c06e50d18055eafd673538f8f406255509e1b3cf.png",
] as const;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

type Direction = "up" | "down";

interface MarqueeColumnConfig {
  seed: number;
  direction: Direction;
  duration: number;
  tileCount: number;
}

const COLUMNS: MarqueeColumnConfig[] = [
  { seed: 1, direction: "up", duration: 34, tileCount: 7 },
  { seed: 2, direction: "down", duration: 40, tileCount: 7 },
  { seed: 3, direction: "up", duration: 30, tileCount: 7 },
  { seed: 4, direction: "down", duration: 38, tileCount: 7 },
];

function MarqueeColumn({
  seed,
  direction,
  duration,
  tileCount,
}: MarqueeColumnConfig) {
  const sequence = seededShuffle(HERO_GRID_IMAGES, seed).slice(0, tileCount);
  const loopSequence = [...sequence, ...sequence];

  return (
    <div className="relative h-full w-full overflow-hidden">
      <motion.div
        className="flex flex-col gap-1.5"
        initial={{ y: direction === "up" ? "0%" : "-50%" }}
        animate={{ y: direction === "up" ? "-50%" : "0%" }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
      >
        {loopSequence.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="relative aspect-200/259 w-full shrink-0 overflow-hidden rounded-lg bg-white/5"
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="180px"
              className="object-cover"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function HeroImageGrid({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div className="grid h-full grid-cols-4 gap-1.5">
        {COLUMNS.map((column) => (
          <MarqueeColumn key={column.seed} {...column} />
        ))}
      </div>
    </div>
  );
}
