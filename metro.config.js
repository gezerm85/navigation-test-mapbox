const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// `.geojson` dosyalarını tanımak için `sourceExts` dizisine ekleyin
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== "json");
config.resolver.sourceExts.push("geojson", "json");

// Font varlıklarını tanıtmak için `assets` dizisini ekleyin
config.transformer = {
  ...config.transformer,
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
};

config.resolver = {
  ...config.resolver,
  assetExts: [...config.resolver.assetExts, 'ttf', 'otf'],
};

module.exports = {
  ...config,
  assets: ['./node_modules/react-native-vector-icons/Fonts'],
};
