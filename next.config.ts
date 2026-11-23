import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    // The same Tailwind loader also supports Webpack when Turbopack cannot
    // start its Windows CSS worker. Run before Next's built-in CSS handling.
    config.module.rules.push({ test: /globals\.css$/, enforce: 'pre', use: ['@tailwindcss/turbopack'] });
    return config;
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
