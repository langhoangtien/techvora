/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/saas",
        destination: "/services",
        permanent: true,
      },
      {
        source: "/saas/:slug*",
        destination: "/services/:slug*",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
