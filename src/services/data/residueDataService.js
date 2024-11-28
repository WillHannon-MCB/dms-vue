/**
 *
 * A collection of functions to deal with residue-level data processing.
 * *
 */
export const ResidueDataService = {
  /**
   * Validates input data for residue processing
   * @param {Array} data - The input data array.
   * @param {Array<{column: string, condition?: string}>} columnConfigs - Array of column and optional condition pairs
   * @throws {Error} - If input data is not an array or is empty, or if columns configuration is invalid
   * @returns {void}
   */
  _validateInput(data, columnConfigs) {
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

      const hasColumn = data.every((item) => config.column in item)
      if (!hasColumn) {
        throw new Error(`Column "${config.column}" is missing from some data objects`)
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
   * Checks if a column contains numeric or categorical data
   * @param {Array} data - The input data array
   * @param {string} column - The column name to check
   * @returns {Object} - Type info and optional warning
   */
  _detectColumnType(data, column) {
    // Check if all non-null values in the column are numbers
    const values = data.map((d) => d[column]).filter((v) => v != null)
    const isNumeric = values.every((v) => !isNaN(parseFloat(v)) && isFinite(v))
    const uniqueValues = new Set(values)

    return {
      type: isNumeric ? 'numeric' : 'categorical',
      uniqueValues: Array.from(uniqueValues),
      warning:
        !isNumeric && uniqueValues.size > 10
          ? `Column "${column}" has ${uniqueValues.size} unique categories. Colors may repeat.`
          : null,
    }
  },

  /**
   * Creates a unique key for a residue-chain-model combination
   * @param {string} residue - The residue identifier.
   * @param {string} chain - The chain identifier.
   * @param {string} model - The model identifier.
   * @returns {string} - The unique key.
   */
  _createKey(residue, chain, model) {
    return `${residue}_${chain}_${model}`
  },

  /**
   * Creates a unique key for a column-condition combination
   * @param {string} column - The column name.
   * @param {string} [condition] - The optional condition.
   * @returns {string} - The unique key.
   */
  _createColumnKey(column, condition = null) {
    return condition ? `${column}-${condition}` : column
  },

  /**
   * Validates required residue fields exist
   * @param {Object} entry - The data entry object.
   * @throws {Error} - If required fields are missing.
   * @returns {void}
   */
  _validateResidueFields(entry) {
    const { residue, chain, model } = entry
    if (residue == null || chain == null || model == null) {
      throw new Error('Entries must have residue, chain, model.')
    }
  },

  /**
   * Groups data by residue identifiers
   * @param {Array} filteredData - The filtered data array.
   * @param {string} column - The metric column to aggregate.
   * @returns {Map} - The grouped data map
   */
  _groupAndValidateData(filteredData, column) {
    const groupedData = new Map()

    filteredData.forEach((entry) => {
      this._validateResidueFields(entry)
      const { residue, chain, model } = entry
      const value = entry[column]
      const key = this._createKey(residue, chain, model)

      if (!groupedData.has(key)) {
        groupedData.set(key, { residue, chain, model, values: new Set() })
      }

      groupedData.get(key).values.add(value)
    })

    return groupedData
  },

  /**
   * Processes grouped data into final format, checking for conflicts
   * i.e there are multiple values for a single residue-chain-model combination
   * preventing the data from being reduced to a single value per residue
   * @param {Map} groupedData - The grouped data map.
   * @param {string} column - The metric column to aggregate.
   * @returns {Array} - The processed data array.
   * @throws {Error} - If conflicts are detected
   */
  _processGroupedData(groupedData, column) {
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
   * @returns {Object} - The processed data and statistics.
   */
  _processSingleMetric(data, column, condition = null) {
    // Filter by condition *only* if provided
    const filteredData = condition ? data.filter((d) => d.condition === condition) : data
    if (filteredData.length === 0) {
      throw new Error(
        `No data found for column '${column}'${condition ? ` with condition '${condition}'` : ''}`,
      )
    }

    // Track statistics
    const stats = {
      total: filteredData.length,
      missing: 0,
      valid: 0,
      models: new Set(),
      chains: new Set(),
      residues: new Set(),
      type: null,
    }

    // Check for numeric or categorical data
    const typeInfo = this._detectColumnType(filteredData, column)
    stats.type = typeInfo.type
    if (typeInfo.type === 'categorical') {
      stats.categories = typeInfo.uniqueValues
      console.info(
        `  • Contains ${stats.categories.length} unique categories: ${stats.categories.join(', ')}`,
      )
    } else {
      stats.valueRange = { min: Infinity, max: -Infinity }
    }

    // Filter and count entries with missing structural data
    const structuralData = filteredData.filter((entry) => {
      const hasStructuralInfo = entry.residue && entry.chain && entry.model
      if (!hasStructuralInfo) {
        stats.missing++
        return false
      }
      stats.valid++

      // Track unique models and chains and residues
      entry.model.split(':').forEach((m) => stats.models.add(m))
      entry.chain
        .split(':')
        .forEach((chainGroup) => chainGroup.split(';').forEach((c) => stats.chains.add(c)))
      stats.residues.add(entry.residue)

      // Track value range if data is numeric
      const value = entry[column]
      if (typeInfo.type === 'numeric') {
        stats.valueRange.min = Math.min(stats.valueRange.min, value)
        stats.valueRange.max = Math.max(stats.valueRange.max, value)
      }

      return true
    })

    // Log statistics and warning for each column-condition pair
    console.info(
      `[ResidueDataService] Data summary for '${column}'${condition ? ` (${condition})` : ''}:\n` +
        `  • ${stats.valid} of ${stats.total} entries have structural information ` +
        `(${((stats.valid / stats.total) * 100).toFixed(1)}%)\n` +
        `  • Type: ${stats.type}\n` +
        `  • Covers ${stats.models.size} model(s): ${Array.from(stats.models).join(', ')}\n` +
        `  • Spans ${stats.chains.size} chain(s): ${Array.from(stats.chains).join(', ')}\n` +
        `  • Contains ${stats.residues.size} unique residue positions\n` +
        `${
          typeInfo.type === 'categorical'
            ? `  • Categories (${stats.categories.length}): ${Array.from(stats.categories).join(', ')}\n`
            : ''
        }` +
        `${
          typeInfo.type === 'numeric'
            ? `  • Value range: ${stats.valueRange.min} to ${stats.valueRange.max}\n`
            : ''
        }`,
    )
    if (stats.missing > 0) {
      console.warn(
        `[ResidueDataService] ${stats.missing} entries (${((stats.missing / stats.total) * 100).toFixed(1)}%) ` +
          `are missing structural information and will not be displayed on the structure.`,
      )
    }
    if (typeInfo.warning) {
      console.warn(`[ResidueDataService] ${typeInfo.warning}`)
    }

    // Group and validate data using only entries with structural information
    const groupedData = this._groupAndValidateData(structuralData, column)

    // Process data into final format
    const processedData = this._processGroupedData(groupedData, column)

    return processedData
  },

  /**
   * Main method for processing multiple residue data metrics
   * @param {Array} data - The input data array.
   * @param {Array<{column: string, condition?: string}>} columnConfigs - Array of column and optional condition pairs
   * @returns {Object} - Object with processed data arrays and statistics keyed by column-condition
   */
  processResidueData(data, columnConfigs) {
    // Validate the raw data and column configuration
    this._validateInput(data, columnConfigs)

    // Process each column-condition pair and store the results
    const result = {}
    columnConfigs.forEach(({ column, condition }) => {
      try {
        const key = this._createColumnKey(column, condition)
        result[key] = this._processSingleMetric(data, column, condition)
      } catch (error) {
        error.message = `Error processing ${column}${condition ? `-${condition}` : ''}: ${error.message}`
        throw error
      }
    })

    return result
  },
}
