/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This project has its own lockfile; pin the tracing root to avoid Next.js
  // inferring a parent workspace when multiple lockfiles exist.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
