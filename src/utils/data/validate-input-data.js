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
