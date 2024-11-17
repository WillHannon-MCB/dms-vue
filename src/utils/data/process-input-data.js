/**
 * Process user-supplied csv data into a useable format.
 */
import { csvParse } from 'd3-dsv'
import { validateCsvData } from '@/utils/data/validate-input-data'

/**
 * Reads CSV data, validates it, and converts it into an array of objects.
 * @param {string} csvText - The CSV content as a string.
 * @param {Array<string>} residueLevelDataColumns - User-specified residue-level data columns.
 * @returns {Array<Object>} - An array of validated parsed objects.
 */
export function parseCsvData(csvText, residueLevelDataColumns = []) {
  try {
    const parsedData = csvParse(csvText)
    validateCsvData(parsedData, residueLevelDataColumns)
    console.log('Parsed CSV data:', parsedData)
    return parsedData
  } catch (error) {
    console.error('Error processing CSV data:', error)
    throw error
  }
}

/**
 * Processes example data to filter and reduce based on a condition and metric.
 *
 * @param {Array} data - The input data array.
 * @param {string} conditionKey - The condition column to filter on.
 * @param {string} metricKey - The metric column to aggregate.
 * @returns {Array} - The processed data array.
 */
export function processExampleData(data, conditionKey, metricKey) {
  // Filter data based on the specified condition
  const filteredData = data.filter((entry) => entry.condition === conditionKey)

  // Reduce data to ensure unique residues, grouped by site, chain, structure, and wildtype
  const reducedData = filteredData.reduce((acc, entry) => {
    const key = `${entry.site}:${entry.chain}:${entry.structure}`
    if (!acc[key]) {
      // Create an entry with the required fields
      acc[key] = {
        site: entry.site,
        wildtype: entry.wildtype,
        chain: entry.chain,
        structure: entry.structure,
        [metricKey]: entry[metricKey],
      }
    } else {
      // Update the metric value if necessary (e.g., take max, mean, or overwrite)
      // For simplicity, we're taking the maximum metric value
      acc[key][metricKey] = Math.max(acc[key][metricKey], entry[metricKey])
    }
    return acc
  }, {})

  // Convert the object back into an array
  return Object.values(reducedData)
}
