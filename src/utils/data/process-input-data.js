import { csvParse } from 'd3-dsv'

/**
 * Reads CSV data, validates it, and converts it into an array of objects.
 * @param {string} csvText - The CSV content as a string.
 * @param {Array<string>} residueLevelDataColumns - User-specified residue-level data columns.
 * @returns {Array<Object>} - An array of validated parsed objects.
 */
export function parseCsvData(csvText, residueLevelDataColumns = []) {
  try {
    // Use d3-dsv's row conversion function to process data
    const parsedData = csvParse(csvText, (row) => {
      Object.keys(row).forEach((key) => {
        // Convert values to numbers if they look numeric
        if (!isNaN(row[key]) && row[key].trim() !== '') {
          row[key] = +row[key] // Convert to number
        }
      })
      return row
    })

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
 * Processes residue-level data given a column name and condition.
 *
 * @param {Array} data - The input data array.
 * @param {string} column - The metric column to aggregate.
 * @param {string} [condition] - The condition column to filter on (optional).
 * @returns {Array} - The processed data array with residue, chain, model, and aggregated column values.
 */
export function processResidueData(data, column, condition = null) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Input data must be a non-empty array.')
  }
  if (typeof column !== 'string' || column.trim() === '') {
    throw new Error('Column name must be a non-empty string.')
  }

  // Filter the data array based on the condition (if provided)
  const filteredData = condition ? data.filter((d) => d.condition === condition) : data

  // Group data by residue, chain, and model
  const groupedData = new Map()

  filteredData.forEach((entry) => {
    const { residue, chain, model } = entry
    const value = entry[column]

    if (residue == null || chain == null || model == null) {
      throw new Error('Entries must have residue, chain, model.')
    }

    const key = `${residue}_${chain}_${model}`

    if (!groupedData.has(key)) {
      groupedData.set(key, { residue, chain, model, values: new Set() })
    }

    const group = groupedData.get(key)
    group.values.add(value)
  })

  // Check for multiple unique values and reduce to a single value
  const processedData = []

  groupedData.forEach((group, key) => {
    const uniqueValues = Array.from(group.values)
    if (uniqueValues.length > 1) {
      throw new Error(
        `Conflict detected for residue-chain-model (${key}): multiple values for column '${column}': ${uniqueValues.join(
          ', ',
        )}`,
      )
    }

    processedData.push({
      residue: group.residue,
      chain: group.chain,
      model: group.model,
      value: uniqueValues[0],
    })
  })

  return processedData
}
