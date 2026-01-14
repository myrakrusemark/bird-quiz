/**
 * Region Loader Utility
 *
 * Handles loading and caching of regions configuration
 */

import type { RegionsConfig, RegionConfig } from '@/types/bird';

let cachedRegionsConfig: RegionsConfig | null = null;

/**
 * Load regions configuration from regions.json
 */
export async function loadRegionsConfig(): Promise<RegionsConfig> {
  if (cachedRegionsConfig) {
    return cachedRegionsConfig;
  }

  try {
    const response = await fetch('/data/regions.json');
    if (!response.ok) {
      throw new Error(`Failed to load regions config: ${response.statusText}`);
    }
    const data: RegionsConfig = await response.json();
    cachedRegionsConfig = data;
    return data;
  } catch (error) {
    console.error('Error loading regions config:', error);
    throw error;
  }
}

/**
 * Get all available regions
 */
export async function getAllRegions(): Promise<RegionConfig[]> {
  const config = await loadRegionsConfig();
  return config.regions;
}

/**
 * Get a specific region by ID
 */
export async function getRegionById(regionId: string): Promise<RegionConfig | undefined> {
  const config = await loadRegionsConfig();
  return config.regions.find(r => r.id === regionId);
}

/**
 * Get default region from configuration
 */
export async function getDefaultRegion(): Promise<RegionConfig> {
  const config = await loadRegionsConfig();
  const defaultRegion = config.regions.find(r => r.id === config.defaultRegion);
  if (!defaultRegion) {
    throw new Error(`Default region '${config.defaultRegion}' not found in configuration`);
  }
  return defaultRegion;
}

/**
 * Clear cached regions configuration
 * Useful for testing or force-reloading
 */
export function clearRegionsCache(): void {
  cachedRegionsConfig = null;
}
