import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(graphql|gql)/,
      exclude: /node_modules/,
      loader: "graphql-tag/loader",
    })

    return config
  },
  experimental: {
    turbo: {
      rules: {
        "*.gql": {
          loaders: ["graphql-tag/loader"],
        },
      },
    },
  },
  devIndicators: false,
}

export default nextConfig
