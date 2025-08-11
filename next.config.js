
/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // This is a workaround to substitute env vars in the service worker
  // In a real production app, you might use a more robust solution like a custom server
  // or a build script.
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
        const swDest = 'public/firebase-messaging-sw.js';
        config.plugins.push(
            new webpack.NormalModuleReplacementPlugin(
                /public\/firebase-messaging-sw\.js/,
                (resource) => {
                    const swPath = resource.request;
                    resource.request = `${swPath}?${new URLSearchParams({
                        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
                    })}`;
                }
            )
        );

         config.module.rules.push({
            test: /firebase-messaging-sw\.js/,
            loader: 'string-replace-loader',
            options: {
              multiple: [
                 { search: '__NEXT_PUBLIC_FIREBASE_API_KEY__', replace: process.env.NEXT_PUBLIC_FIREBASE_API_KEY },
                 { search: '__NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN__', replace: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN },
                 { search: '__NEXT_PUBLIC_FIREBASE_PROJECT_ID__', replace: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID },
                 { search: '__NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET__', replace: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET },
                 { search: '__NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID__', replace: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID },
                 { search: '__NEXT_PUBLIC_FIREBASE_APP_ID__', replace: process.env.NEXT_PUBLIC_FIREBASE_APP_ID },
              ]
            }
        });
    }
    // Force cache invalidation by adding a comment
    return config;
  },
  serverExternalPackages: ['firebase-admin'],
};

module.exports = nextConfig;
