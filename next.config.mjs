/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: { allowedOrigins: [] },
  },
  async redirects() {
    return [
      { source: '/quests', destination: '/guides/quests', permanent: true },
      { source: '/dungeons', destination: '/guides/dungeons', permanent: true },
      { source: '/masters', destination: '/guides/masters', permanent: true },
      { source: '/attributes', destination: '/guides/attributes', permanent: true },
      { source: '/weapons', destination: '/equipment', permanent: true },
      { source: '/manuals', destination: '/equipment/manuals', permanent: true },
      { source: '/five-elements', destination: '/systems/five-elements', permanent: true },
      { source: '/effect-simulator', destination: '/skills/simulator', permanent: true },
      { source: '/macros', destination: '/tools/macros', permanent: true },
      { source: '/macros/dazuo-ocr', destination: '/tools/macros/dazuo-ocr', permanent: true },
    ];
  },
};

export default nextConfig;
