import { defineStore } from 'pinia'
import { DataProcessingService } from '@/services/data/processing'

export const useDataStore = defineStore('data', {
  state: () => ({
    data: null,
    status: {
      message: '',
      type: null, // 'success' | 'error' | null
    },
  }),

  actions: {
    async processData(csvText) {
      try {
        const parsedData = await DataProcessingService.parseCSV(csvText)
        this.data = parsedData
        this.status = { message: 'Success!', type: 'success' }
      } catch (error) {
        this.data = null
        this.status = { message: error.message, type: 'error' }
        throw error
      }
    },

    clearStatus() {
      this.status = { message: '', type: null }
    },
  },

  getters: {
    models: (state) => {
      if (!state.data) return []
      return Array.from(new Set(state.data.flatMap((row) => row._parsed_models?.flat() ?? [])))
    },

    modelChainMap: (state) => {
      if (!state.data) return new Map()

      return state.data.reduce((mapping, row) => {
        if (!row._parsed_models || !row._parsed_chains) return mapping

        row._parsed_models.forEach((modelGroup, groupIndex) => {
          const chainGroup = row._parsed_chains[groupIndex]
          modelGroup.forEach((model) => {
            if (!mapping.has(model)) mapping.set(model, new Set())
            chainGroup.forEach((chain) => mapping.get(model).add(chain))
          })
        })
        return mapping
      }, new Map())
    },

    structures: (state) =>
      state.models.map((model) => ({
        url: DataProcessingService.getStructureUrl(model),
        format: 'mmcif',
        assemblyId: '1',
        isBinary: false,
      })),

    conditions: (state) => {
      if (!state.data?.[0]?.condition) return []
      return Array.from(new Set(state.data.map((row) => row.condition)))
    },

    hasMutations: (state) => state.data?.[0]?.mutant !== undefined,
  },
})
