import { defineStore } from 'pinia'
import { parseCsvData } from '@/utils/data/process-input-data'

export const useDataStore = defineStore('data', {
  state: () => ({
    rawData: null,
    successMessage: '',
    errorMessage: '',
  }),

  actions: {
    async uploadData(csvText, fileName = null) {
      try {
        const parsedData = parseCsvData(csvText)
        this.rawData = parsedData
        console.log('Data uploaded and validated:', this.rawData)
        this.successMessage = fileName
          ? `File "${fileName}" uploaded and validated successfully!`
          : 'Data uploaded and validated successfully!'
        this.errorMessage = ''
      } catch (error) {
        this.rawData = null
        this.successMessage = ''
        this.errorMessage = `Error processing CSV: ${error.message}`
        throw error
      }
    },
  },

  getters: {
    // Get all unique models across all entries
    models(state) {
      if (!state.rawData) return []
      return Array.from(new Set(state.rawData.flatMap((row) => row._parsed_models?.flat() ?? [])))
    },

    // Get model-chain mappings
    modelChainMap(state) {
      if (!state.rawData) return new Map()

      const mapping = new Map()

      state.rawData.forEach((row) => {
        if (!row._parsed_models || !row._parsed_chains) return

        row._parsed_models.forEach((modelGroup, groupIndex) => {
          const chainGroup = row._parsed_chains[groupIndex]
          modelGroup.forEach((model) => {
            if (!mapping.has(model)) {
              mapping.set(model, new Set())
            }
            chainGroup.forEach((chain) => {
              mapping.get(model).add(chain)
            })
          })
        })
      })

      return mapping
    },

    // Get structure configuration objects for Mol*
    structures() {
      return this.models.map((model) => ({
        url: `https://www.ebi.ac.uk/pdbe/static/entry/${model.toLowerCase()}_updated.cif`,
        format: 'mmcif',
        assemblyId: '1',
        isBinary: false,
      }))
    },

    // Get conditions if they exist
    conditions(state) {
      if (!state.rawData || !state.rawData[0]?.condition) {
        return []
      }
      return Array.from(new Set(state.rawData.map((row) => row.condition)))
    },

    // Check if data has mutations
    hasMutations(state) {
      return state.rawData?.[0]?.mutant !== undefined
    },
  },
})
