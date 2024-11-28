/**
 * A collection of utility functions for generating color scales.
 */
import { min, max, scaleSequential, scaleDiverging, scaleOrdinal } from 'd3'
import * as d3Chromatic from 'd3-scale-chromatic'

// Available color schemes by scale type
export const colorSchemes = {
  sequential: [
    'viridis',
    'magma',
    'inferno',
    'plasma',
    'warm',
    'cool',
    'blues',
    'greens',
    'greys',
    'oranges',
    'purples',
    'reds',
  ],
  diverging: ['RdBu', 'BrBG', 'PRGn', 'PiYG', 'PuOr', 'RdGy', 'RdYlBu', 'RdYlGn', 'Spectral'],
  categorical: ['tableau10', 'set1', 'set2', 'set3', 'paired', 'category10'],
}

/**
 * Gets a D3 interpolator function from a scheme name
 */
function getColorInterpolator(schemeName, scaleType) {
  const name = `interpolate${schemeName.charAt(0).toUpperCase()}${schemeName.slice(1)}`
  if (scaleType === 'diverging' && !name.startsWith('interpolate')) {
    return d3Chromatic[`interpolate${schemeName}`]
  }
  return d3Chromatic[name]
}

/**
 * Gets a D3 color scheme array from a scheme name
 */
function getColorScheme(schemeName) {
  const name = `scheme${schemeName.charAt(0).toUpperCase()}${schemeName.slice(1)}`
  return d3Chromatic[name]
}

/**
 * Generates a sequential color scale
 */
export function generateSequentialColorScale(data, key, config = {}) {
  const { scheme = 'viridis', domain: customDomain, reverse = false } = config

  const values = data.map((d) => d[key])
  const domain = customDomain || [min(values), max(values)]
  if (reverse) domain.reverse()

  const interpolator = getColorInterpolator(scheme, 'sequential')
  return scaleSequential(interpolator).domain(domain)
}

/**
 * Generates a diverging color scale
 */
export function generateDivergingColorScale(data, key, config = {}) {
  const { scheme = 'RdBu', domain: customDomain, midpoint = 0, reverse = false } = config

  const values = data.map((d) => d[key])
  const domain = customDomain || [min(values), midpoint, max(values)]
  if (reverse) domain.reverse()

  const interpolator = getColorInterpolator(scheme, 'diverging')
  return scaleDiverging(interpolator).domain(domain)
}

/**
 * Generates a categorical color scale
 */
export function generateCategoricalColorScale(data, key, config = {}) {
  const { scheme = 'tableau10', domain: customDomain, unknownColor = '#777777' } = config

  const values = data.map((d) => d[key])
  const domain = customDomain || Array.from(new Set(values))

  const colorScheme = getColorScheme(scheme)

  // Handle case where we have more categories than colors
  if (domain.length > colorScheme.length) {
    const extendedColors = []
    for (let i = 0; i < domain.length; i++) {
      extendedColors.push(colorScheme[i % colorScheme.length])
    }
    return scaleOrdinal(extendedColors).domain(domain).unknown(unknownColor)
  }

  return scaleOrdinal(colorScheme).domain(domain).unknown(unknownColor)
}
