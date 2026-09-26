import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: [
    "@mastra/core",
    "@mastra/loggers",
    "@mastra/memory",
    "@mastra/observability",
    "@mastra/pg",
    "mastra",
  ],
};

export default nextConfig;
