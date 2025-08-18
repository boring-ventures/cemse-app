module.exports = ({ config }) => {
  // Return the dynamic configuration object
  return {
    // Spread the static config from app.json
    ...config,
    // Add or override any dynamic values
    extra: {
      // Spread the existing extra config
      ...config.extra,
    },
  };
}; 