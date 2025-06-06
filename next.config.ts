import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav:true,
  aggressiveFrontEndNavCaching:false,
  reloadOnOnline: false,
  disable:false,
  workboxOptions: {
    disableDevLogs:true,
}});

export default withPWA({

  // Your Next.js config
});