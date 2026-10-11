import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@classmate/ui", "@classmate/realtime-types"],
};

export default nextConfig;
