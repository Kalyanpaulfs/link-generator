import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // {
      //   source: "/w/:slug",
      //   // UPDATE THIS URL AFTER DEPLOYING FIREBASE FUNCTIONS
      //   // Example: https://us-central1-link-generator-4ea06.cloudfunctions.net/w
      //   destination: "REPLACE_WITH_YOUR_CLOUD_FUNCTION_URL",
      // },
    ];
  },
};

export default nextConfig;
