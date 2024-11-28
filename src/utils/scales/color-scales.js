/**
 * A collection of utility functions for generating color scales.
 */
import { min, max, scaleSequential, scaleDiverging, scaleOrdinal } from 'd3'
import { interpolateViridis, interpolateRdBu, schemeTableau10 } from 'd3-scale-chromatic'

/**
 * Generates a sequential color scale based on the data for a specified key.
 *
 * @param {Array} data - The array of user-supplied data.
 * @param {string} key - The key in the data objects to base the scale on.
 * @param {Function} colorScheme - The D3 interpolator to use (default: d3.interpolateViridis).
 * @returns {Function} - A D3 scale function that maps values to colors.
 */
export function generateSequentialColorScale(data, key, colorScheme = interpolateViridis) {
  const values = data.map((d) => d[key])
  const domain = [min(values), max(values)]
  return scaleSequential(colorScheme).domain(domain)
}

/**
 * Generates a diverging color scale based on the data for a specified key.
 *
 * @param {Array} data - The array of user-supplied data.
 * @param {string} key - The key in the data objects to base the scale on.
 * @param {number} midpoint - The midpoint value for the diverging scale.
 * @param {Function} colorScheme - The D3 interpolator to use (default: d3.interpolateRdBu).
 * @returns {Function} - A D3 scale function that maps values to colors.
 */
export function generateDivergingColorScale(data, key, midpoint, colorScheme = interpolateRdBu) {
  const values = data.map((d) => d[key])
  const domain = [min(values), midpoint, max(values)]
  return scaleDiverging(colorScheme).domain(domain)
}

/**
 * Generates a categorical color scale for discrete data.
 *
 * @param {Array} categories - An array of unique category names.
 * @param {Array} colors - An array of color strings to assign to the categories (default: d3.schemeTableau10).
 * @returns {Function} - A D3 scale function that maps categories to colors.
 */
export function generateCategoricalColorScale(categories, colors = schemeTableau10) {
  // If there are more categories than colors, cycle through colors
  if (categories.length > colors.length) {
    const extendedColors = []
    for (let i = 0; i < categories.length; i++) {
      extendedColors.push(colors[i % colors.length])
    }
    return scaleOrdinal(extendedColors).domain(categories).unknown('#777777') // gray for unknown
  }

  return scaleOrdinal(colors).domain(categories).unknown('#777777')
}
