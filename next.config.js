/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure API routes can handle larger payloads for article generation
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
}

module.exports = nextConfig
