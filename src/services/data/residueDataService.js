export const ResidueDataService = {
  /**
   * Validates input data for residue processing
   * @param {Array} data - The input data array.
   * @param {Array<{column: string, condition?: string}>} columnConfigs - Array of column and optional condition pairs
   * @throws {Error} - If input data is not an array or is empty, or if columns configuration is invalid
   * @returns {void}
   */
  validateInput(data, columnConfigs) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Input data must be a non-empty array.')
    }
    if (!Array.isArray(columnConfigs) || columnConfigs.length === 0) {
      throw new Error('Column configs must be a non-empty array.')
    }
    columnConfigs.forEach((config) => {
      if (typeof config.column !== 'string' || config.column.trim() === '') {
        throw new Error('Column name must be a non-empty string.')
      }
      if (
        config.condition !== undefined &&
        (typeof config.condition !== 'string' || config.condition.trim() === '')
      ) {
        throw new Error('Condition must be a non-empty string if provided.')
      }
    })
  },

  /**
   * Creates a unique key for a residue-chain-model combination
   * @param {string} residue - The residue identifier.
   * @param {string} chain - The chain identifier.
   * @param {string} model - The model identifier.
   * @returns {string} - The unique key.
   */
  createKey(residue, chain, model) {
    return `${residue}_${chain}_${model}`
  },

  /**
   * Creates a unique key for a column-condition combination
   * @param {string} column - The column name.
   * @param {string} [condition] - The optional condition.
   * @returns {string} - The unique key.
   */
  createColumnKey(column, condition = null) {
    return condition ? `${column}-${condition}` : column
  },

  /**
   * Validates required residue fields exist
   * @param {Object} entry - The data entry object.
   * @throws {Error} - If required fields are missing.
   * @returns {void}
   */
  validateResidueFields(entry) {
    const { residue, chain, model } = entry
    if (residue == null || chain == null || model == null) {
      throw new Error('Entries must have residue, chain, model.')
    }
  },

  /**
   * Groups data by residue identifiers and checks for value conflicts
   * @param {Array} filteredData - The filtered data array.
   * @param {string} column - The metric column to aggregate.
   * @returns {Map} - The grouped data map
   */
  groupAndValidateData(filteredData, column) {
    const groupedData = new Map()

    filteredData.forEach((entry) => {
      this.validateResidueFields(entry)
      const { residue, chain, model } = entry
      const value = entry[column]
      const key = this.createKey(residue, chain, model)

      if (!groupedData.has(key)) {
        groupedData.set(key, { residue, chain, model, values: new Set() })
      }

      groupedData.get(key).values.add(value)
    })

    return groupedData
  },

  /**
   * Processes grouped data into final format, checking for conflicts
   * @param {Map} groupedData - The grouped data map.
   * @param {string} column - The metric column to aggregate.
   * @returns {Array} - The processed data array.
   * @throws {Error} - If conflicts are detected
   */
  processGroupedData(groupedData, column) {
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
  },

  /**
   * Process data for a single column-condition pair
   * @param {Array} data - The input data array.
   * @param {string} column - The metric column to aggregate.
   * @param {string} [condition] - The condition to filter on (optional).
   * @returns {Array} - The processed data array.
   */
  processSingleMetric(data, column, condition = null) {
    // Filter by condition if provided
    const filteredData = condition ? data.filter((d) => d.condition === condition) : data

    // Group and validate data
    const groupedData = this.groupAndValidateData(filteredData, column)

    // Process into final format
    return this.processGroupedData(groupedData, column)
  },

  /**
   * Main method for processing multiple residue data metrics
   * @param {Array} data - The input data array.
   * @param {Array<{column: string, condition?: string}>} columnConfigs - Array of column and optional condition pairs
   * @returns {Object} - Object with processed data arrays keyed by column-condition
   */
  processResidueData(data, columnConfigs) {
    this.validateInput(data, columnConfigs)

    const result = {}

    columnConfigs.forEach(({ column, condition }) => {
      try {
        const key = this.createColumnKey(column, condition)
        result[key] = this.processSingleMetric(data, column, condition)
      } catch (error) {
        // Add context about which column-condition pair caused the error
        error.message = `Error processing ${column}${condition ? `-${condition}` : ''}: ${error.message}`
        throw error
      }
    })

    return result
  },
}
