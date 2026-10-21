/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  swcMinify: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "@aws-amplify/ui-react"],
  },
};

module.exports = nextConfig;
