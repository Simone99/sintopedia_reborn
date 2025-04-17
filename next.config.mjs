/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'licensebuttons.net',
            port: '',
            pathname: '/l/by-nc-sa/4.0/**',
            search: '',
          },
        ],
      },
};

export default nextConfig;
