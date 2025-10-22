// next.config.mjs
import path from "path";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const wagmiDir = path.dirname(require.resolve("wagmi/package.json"));
console.log("[next.config.mjs] wagmiDir ->", wagmiDir);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      wagmi: path.resolve(process.cwd(), "wagmi-shim.mjs"),
      "wagmi$": path.resolve(process.cwd(), "wagmi-shim.mjs"),
      "wagmi-original": wagmiDir,
      "wagmi-original$": wagmiDir,
    };
    return config;
  },
};

export default nextConfig;
