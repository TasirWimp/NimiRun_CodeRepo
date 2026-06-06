export function preloadNimiRunV2Assets(scene, manifest) {
  for (const asset of manifest.assets) {
    if (asset.type === 'image') {
      scene.load.image(asset.key, asset.path);
    }
  }
}
