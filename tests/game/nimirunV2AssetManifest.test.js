import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import manifest from '../../src/game/assets/nimirunV2AssetManifest.json';
import { preloadNimiRunV2Assets } from '../../src/game/assets/preloadNimiRunV2Assets.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function resolvePublicAssetPath(assetPath) {
  return path.join(repoRoot, 'public', assetPath.replace(/^\//, ''));
}

describe('NimiRun V2 asset manifest', () => {
  it('documents the node-map runtime mode and source-ocean viewport', () => {
    expect(manifest).toMatchObject({
      name: 'NimiRun V2 Game Assets',
      mapMode: 'node_path_node_no_free_movement',
      sourceOceanViewport: {
        width: 640,
        height: 420,
      },
      tileSize: 48,
      nodePadSize: 96,
    });
  });

  it('points every runtime asset entry at a committed public file', () => {
    expect(manifest.assets.length).toBeGreaterThan(40);

    for (const asset of manifest.assets) {
      expect(asset.type).toBe('image');
      expect(asset.path).toMatch(/^\/assets\/nimirun-v2\//);
      expect(existsSync(resolvePublicAssetPath(asset.path)), asset.path).toBe(true);
    }
  });

  it('contains the keys used by PocketBotWorkshop', () => {
    const assetKeys = new Set(manifest.assets.map((asset) => asset.key));

    expect(assetKeys.has('source_ocean_moonlit_640x420')).toBe(true);
    expect(assetKeys.has('bot_v2_idle')).toBe(true);
    expect(assetKeys.has('node_ring_selected_96')).toBe(true);
    expect(assetKeys.has('node_pad_context_shrine_96')).toBe(true);
    expect(assetKeys.has('node_context_shrine_64')).toBe(true);
    expect(assetKeys.has('path_thread_fogged_128x32')).toBe(true);
    expect(assetKeys.has('hud_panel_frame_v2')).toBe(true);
    expect(assetKeys.has('proposal_card_frame_v2')).toBe(true);
  });

  it('preloads every image asset through the Phaser load API', () => {
    const loadedImages = [];
    const scene = {
      load: {
        image: (key, assetPath) => loadedImages.push({ key, path: assetPath }),
      },
    };

    preloadNimiRunV2Assets(scene, manifest);

    expect(loadedImages).toHaveLength(manifest.assets.length);
    expect(loadedImages[0]).toMatchObject({
      key: manifest.assets[0].key,
      path: manifest.assets[0].path,
    });
  });

  it('keeps V2 SVG placeholders free of baked UI text labels', () => {
    const svgAssets = manifest.assets.filter((asset) => asset.path.endsWith('.svg'));

    expect(svgAssets.length).toBeGreaterThan(0);

    for (const asset of svgAssets) {
      const source = readFileSync(resolvePublicAssetPath(asset.path), 'utf8');

      expect(source, asset.path).not.toMatch(/<text\b/i);
      expect(source, asset.path).not.toMatch(/font-family/i);
    }
  });
});
