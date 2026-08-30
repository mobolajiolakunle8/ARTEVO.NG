import type { NextConfig } from "next";
import path from "path";

/**
 * ARTÉVO — Vercel-ready Next.js configuration.
 *
 * The project root is explicitly pinned because deployments may use this app
 * from a repository sub-directory. Turbopack then reads the `@/*` alias from
 * tsconfig.json consistently in local, preview, and Vercel production builds.
 */
const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },

  // Fallback only when Webpack is selected instead of Turbopack.
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.join(projectRoot, "src"),
    };
    return config;
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    localPatterns: [{ pathname: "/uploads/**" }],
  },
};

export default nextConfig;
