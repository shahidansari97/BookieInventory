const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add any custom Metro configuration here
config.resolver.alias = {
  '@': './src',
};

module.exports = config;