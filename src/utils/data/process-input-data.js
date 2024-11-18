/**
 * Process user-supplied csv data into a useable format.
 */
import { csvParse } from 'd3-dsv'

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
    return parsedData
  } catch (error) {
    console.error('Error processing CSV data:', error)
    throw error
  }
}

/**
 * Utility functions for validating user-supplied input data.
 */

/**
 * Validate user-supplied CSV data.
 * @param {Array<Object>} data - Parsed CSV data as an array of objects.
 * @param {Array<string>} residueLevelDataColumns - User-specified residue-level data columns.
 * @returns {boolean} - True if the data is valid, otherwise throws an error.
 * @throws {Error} - If validation fails.
 */
export function validateCsvData(data, residueLevelDataColumns = []) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('CSV data is empty or invalid.')
  }

  // Required columns
  const requiredColumns = ['residue', 'chain', 'model']

  // Check for required columns
  const csvColumns = Object.keys(data[0])
  requiredColumns.forEach((col) => {
    if (!csvColumns.includes(col)) {
      throw new Error(`Missing required column: ${col}`)
    }
  })

  // Check for user-specified residue-level data columns
  residueLevelDataColumns.forEach((col) => {
    if (!csvColumns.includes(col)) {
      throw new Error(`Missing user-specified residue-level data column: ${col}`)
    }
  })

  // Check for condition column if duplicate model-chain-residue exists
  const seenResidues = new Set()
  for (const row of data) {
    const key = `${row.model}-${row.chain}-${row.residue}`
    if (seenResidues.has(key) && !csvColumns.includes('condition')) {
      throw new Error(`Duplicate model-chain-residue detected without a 'condition' column: ${key}`)
    }
    seenResidues.add(key)
  }

  // Check for mutant column if multiple entries exist for model-condition-residue-chain
  const modelConditionResidueChainMap = new Map()
  for (const row of data) {
    const key = `${row.model}-${row.condition || ''}-${row.residue}-${row.chain}`
    if (modelConditionResidueChainMap.has(key)) {
      if (!csvColumns.includes('mutant')) {
        throw new Error(
          `Multiple entries detected for model-condition-residue-chain (${key}), but 'mutant' column is missing.`,
        )
      }
    } else {
      modelConditionResidueChainMap.set(key, true)
    }
  }

  return true
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
