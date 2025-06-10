import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav:true,
  aggressiveFrontEndNavCaching:true,
  reloadOnOnline: true,
  disable:true,
  workboxOptions: {
    disableDevLogs:true,
}});

export default withPWA({

  // Your Next.js config
});