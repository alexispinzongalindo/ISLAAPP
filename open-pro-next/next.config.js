const withMDX = require("@next/mdx")();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure `pageExtensions` to include MDX files
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  // Serve static live demos from /public/live/<slug>/index.html
  async rewrites() {
    return [
      {
        source: "/live/:slug",
        destination: "/live/:slug/index.html",
      },
    ];
  },
};

module.exports = withMDX(nextConfig);
