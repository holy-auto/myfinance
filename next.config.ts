import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // allowedDevOriginsでCORS/cross-originの警告を抑制
  allowedDevOrigins: [
    "3000-i9ljhh25ppvzzhwhgx5n7-d0b9e1e2.sandbox.novita.ai",
    "*.sandbox.novita.ai",
  ],
};

export default nextConfig;
