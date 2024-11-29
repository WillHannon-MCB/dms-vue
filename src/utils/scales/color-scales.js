/**
 * A collection of utility functions for generating color scales.
 */
import { min, max, scaleSequential, scaleDiverging, scaleOrdinal } from 'd3'
import * as d3Chromatic from 'd3-scale-chromatic'

// Available color schemes by scale type
export const colorSchemes = {
  sequential: [
    'blues',
    'greens',
    'greys',
    'oranges',
    'purples',
    'reds',
    'turbo',
    'viridis',
    'inferno',
    'magma',
    'plasma',
    'cividis',
    'warm',
    'cool',
    'CubehelixDefault',
    'BuGn',
    'BuPu',
    'GnBu',
    'OrRd',
    'PuBuGn',
    'PuBu',
    'PuRd',
    'RdPu',
    'YlGnBu',
    'YlGn',
    'YlOrBr',
    'YlOrRd',
  ],
  diverging: ['BrBG', 'PRGn', 'PiYG', 'PuOr', 'RdBu', 'RdGy', 'RdYlBu', 'RdYlGn', 'Spectral'],
  categorical: [
    'tableau10',
    'observable10',
    'category10',
    'dark2',
    'set1',
    'set2',
    'set3',
    'paired',
  ],
}

/**
 * Gets a D3 interpolator function from a color scheme name
 * @param {string} schemeName - The name of the color scheme
 * @returns {function} - The D3 interpolator function
 */
function getColorInterpolator(schemeName) {
  const name = `interpolate${schemeName.charAt(0).toUpperCase()}${schemeName.slice(1)}`
  return d3Chromatic[name]
}

/**
 * Gets a D3 color scheme array from a color scheme name
 * @param {string} schemeName - The name of the color scheme
 * @returns {array} - The D3 color scheme array
 */
function getColorScheme(schemeName) {
  const name = `scheme${schemeName.charAt(0).toUpperCase()}${schemeName.slice(1)}`
  return d3Chromatic[name]
}

/**
 * Generates a sequential color scale
 * @param {array} data - The data array
 * @param {string} key - The key to use for the color scale
 * @param {object} config - The configuration object
 * @returns {function} - The D3 color scale function
 */
export function generateSequentialColorScale(data, key, config = {}) {
  const { scheme = 'viridis', domain: customDomain, reverse = false } = config

  const values = data.map((d) => d[key])
  const domain = customDomain || [min(values), max(values)]
  if (reverse) domain.reverse()

  const interpolator = getColorInterpolator(scheme)
  return scaleSequential(interpolator).domain(domain)
}

/**
 * Generates a diverging color scale
 * @param {array} data - The data array
 * @param {string} key - The key to use for the color scale
 * @param {object} config - The configuration object
 * @returns {function} - The D3 color scale function
 */
export function generateDivergingColorScale(data, key, config = {}) {
  const { scheme = 'RdBu', domain: customDomain, midpoint = 0, reverse = false } = config

  const values = data.map((d) => d[key])
  const domain = customDomain || [min(values), midpoint, max(values)]
  if (reverse) domain.reverse()

  const interpolator = getColorInterpolator(scheme)
  return scaleDiverging(interpolator).domain(domain)
}

/**
 * Generates a categorical color scale
 * @param {array} data - The data array
 * @param {string} key - The key to use for the color scale
 * @param {object} config - The configuration object
 * @returns {function} - The D3 color scale function
 */
export function generateCategoricalColorScale(data, key, config = {}) {
  const { scheme = 'tableau10', domain: customDomain, unknownColor = '#777777' } = config

  const values = data.map((d) => d[key])
  const domain = customDomain || Array.from(new Set(values))

  const colorScheme = getColorScheme(scheme)

  // Handle case where we have more categories than colors
  if (domain.length > colorScheme.length) {
    // Log a warning that we are extending the color scheme
    console.warn(
      `The number of categories (${domain.length}) exceeds the number of colors in the color scheme (${colorScheme.length}).`,
    )
    const extendedColors = []
    for (let i = 0; i < domain.length; i++) {
      extendedColors.push(colorScheme[i % colorScheme.length])
    }
    return scaleOrdinal(extendedColors).domain(domain).unknown(unknownColor)
  }

  return scaleOrdinal(colorScheme).domain(domain).unknown(unknownColor)
}
