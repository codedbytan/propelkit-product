import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["pdfkit"], // 👈 Adds pdfkit to the external packages list
};

export default nextConfig;