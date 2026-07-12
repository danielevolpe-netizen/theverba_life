import { loadEnvFile } from "node:process";
import type { NextConfig } from "next";

if (!process.env.DATABASE_URL) {
  try {
    loadEnvFile("../../.env");
  } catch {
    // Hosted environments inject DATABASE_URL directly.
  }
}

const nextConfig: NextConfig = {
  transpilePackages: ["@lifelang/ai", "@lifelang/contracts", "@lifelang/db", "@lifelang/domain"],
  reactStrictMode: true
};

export default nextConfig;
