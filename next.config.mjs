import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Penting: pakai 'wagmi$' (EXACT match), sehingga 'wagmi/chains' tetap ke node_modules
      "wagmi$": path.resolve(__dirname, "src/wagmi-shim.ts"),
    };
    return config;
  },
};

export default nextConfig;
