import { csvParse, autoType } from 'd3-dsv'

/**
 * Parses a string in the input data containing multiple values
 * @param {string} str - String containing multiple values (e.g., "6XR8:6XRA" or "A;B;C:A;B;C")
 * @param {string} primaryDelimiter - Primary delimiter (e.g., ":" split between model groups)
 * @param {string} secondaryDelimiter - Secondary delimiter (e.g., ";" split within model groups)
 * @returns {Array<Array<string>>} Array of arrays containing parsed values
 */
function parseDelimitedValues(str, primaryDelimiter = ':', secondaryDelimiter = ';') {
  return str
    .split(primaryDelimiter)
    .map((group) => group.split(secondaryDelimiter).map((val) => val.trim()))
}

/**
 * Parses CSV data with automatic type inference and model/chain parsing
 * @param {string} csvText - The CSV content as a string
 * @returns {Array<Object>} Array of parsed objects
 */
export function parseCsvData(csvText) {
  try {
    // First pass: automatic type inference
    const autoTypedData = csvParse(csvText, autoType)

    // Validate the data structure
    validateCsvData(autoTypedData)

    // Second pass: parse model and chain fields
    const parsedData = autoTypedData.map((row) => {
      // Create a new object to avoid modifying the original
      const newRow = { ...row }

      if (newRow.model) {
        newRow._parsed_models = parseDelimitedValues(newRow.model)
      }
      if (newRow.chain) {
        newRow._parsed_chains = parseDelimitedValues(newRow.chain)
      }

      return newRow
    })
    return parsedData
  } catch (error) {
    console.error('Error processing CSV data:', error)
    throw error
  }
}

/**
 * Validate user-supplied CSV data structure before processing.
 * @param {Array<Object>} data - Parsed CSV data as an array of objects.
 * @returns {boolean} - True if the data is valid, otherwise throws an error.
 * @throws {Error} - If validation fails.
 */
export function validateCsvData(data) {
  // Check for empty data
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('CSV data is empty or invalid.')
  }

  // Check for required columns
  const requiredColumns = ['residue', 'chain', 'model']
  const csvColumns = Object.keys(data[0])
  requiredColumns.forEach((col) => {
    if (!csvColumns.includes(col)) {
      throw new Error(`Missing required column: ${col}`)
    }
  })

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
