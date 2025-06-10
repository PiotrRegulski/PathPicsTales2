import withPWAInit from "@ducanh2912/next-pwa";


const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: false, // włącz PWA
  workboxOptions: {
    disableDevLogs: true,
  
  },
});

export default withPWA({
  // Tutaj możesz dodać inne opcje Next.js
});
