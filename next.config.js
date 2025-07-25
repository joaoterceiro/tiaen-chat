﻿/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['avatar.iran.liara.run', 'supabase.co', 'localhost'],
  },
}

module.exports = nextConfig
