module.exports = ({ config }) => {
  // Return the dynamic configuration object
  return {
    // Spread the static config from app.json
    ...config,
    // Add or override any dynamic values
    extra: {
      // Spread the existing extra config
      ...config.extra,
      // Add environment variables
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  };
}; 