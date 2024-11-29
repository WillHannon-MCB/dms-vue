/**
 * A collection of operations related to raw data processing.
 */
import { csvParse, autoType } from 'd3-dsv'

export const RawDataService = {
  /**
   * Parses a string in the input data containing multiple values
   * @param {string} str - String containing multiple values (e.g., "6XR8:6XRA" or "A;B;C:A;B;C")
   * @param {string} primaryDelimiter - Primary delimiter (e.g., ":" split between model groups)
   * @param {string} secondaryDelimiter - Secondary delimiter (e.g., ";" split within model groups)
   */
  parseDelimitedValues(str, primaryDelimiter = ':', secondaryDelimiter = ';') {
    return str
      .split(primaryDelimiter)
      .map((group) => group.split(secondaryDelimiter).map((val) => val.trim()))
  },

  /**
   * Validates user-supplied CSV data structure before processing.
   * @param {Array<Object>} data - Parsed CSV data as an array of objects.
   * @returns {boolean} - True if the data is valid, otherwise throws an error.
   * @throws {Error} - If validation fails
   */
  validateData(data) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('CSV data is empty or invalid.')
    }

    const requiredColumns = ['residue', 'chain', 'model']
    const csvColumns = Object.keys(data[0])
    requiredColumns.forEach((col) => {
      if (!csvColumns.includes(col)) {
        throw new Error(`Missing required column: ${col}`)
      }
    })

    return true
  },

  /**
   * Parses CSV data with automatic type inference and model/chain parsing
   * @param {string} csvText - The CSV content as a string
   * @returns {Array<Object>} - Array of parsed objects
   * @throws {Error} - If parsing fails
   */
  async parseCSV(csvText) {
    try {
      const autoTypedData = csvParse(csvText, autoType)
      this.validateData(autoTypedData)

      return autoTypedData.map((row) => {
        const newRow = { ...row }
        if (newRow.model) {
          newRow._parsed_models = this.parseDelimitedValues(newRow.model)
        }
        if (newRow.chain) {
          newRow._parsed_chains = this.parseDelimitedValues(newRow.chain)
        }
        return newRow
      })
    } catch (error) {
      throw new Error(`Failed to parse CSV: ${error.message}`)
    }
  },
  /**
   * Get the data URL for a given model (for testing purposes)
   * @param {string} model - Model identifier
   * @returns {string} - Data URL
   */
  getStructureUrl(model) {
    return `https://www.ebi.ac.uk/pdbe/static/entry/${model.toLowerCase()}_updated.cif`
  },
}
