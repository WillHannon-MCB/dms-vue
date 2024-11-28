import { defineStore } from 'pinia'
import { useDataStore } from './data'

export const useConfigStore = defineStore('config', {
  state: () => ({
    // Core configuration
    residueColumns: ['max_mut_escape'], // Selected columns containing residue-level data
    conditions: ['REGN10933', 'REGN10987'], // Selected conditions to visualize
    // Detailed settings for each residue data column
    residueSettings: {
      // Example structure:
      // mean_escape: {
      //   conditions: ['library A'], // Selected conditions for this metric
      //   colorScale: {
      //     name: 'viridis',
      //     type: 'sequential'
      //   }
      // }
    },
  }),

  getters: {
    // Get configuration for specific residue data + condition combination
    getResidueConfig: (state) => (residueColumn, condition) => {
      const settings = state.residueSettings[residueColumn]
      if (!settings) return null

      return {
        colorScale: settings.colorScale,
        condition: condition,
      }
    },

    // Get all active conditions for a residue column
    getActiveConditions: (state) => (residueColumn) => {
      const dataStore = useDataStore()
      const settings = state.residueSettings[residueColumn]

      // If no specific conditions set, return all available conditions
      if (!settings?.conditions?.length) {
        return dataStore.conditions
      }

      return settings.conditions
    },
  },

  actions: {
    // Set selected residue data columns
    setResidueData(columns) {
      this.residueData = columns

      // Initialize settings for newly added columns
      columns.forEach((col) => {
        if (!this.residueSettings[col]) {
          this.residueSettings[col] = {
            conditions: [], // Empty means all conditions
            colorScale: {
              name: 'viridis',
              type: 'sequential',
            },
          }
        }
      })

      // Clean up settings for removed columns
      Object.keys(this.residueSettings).forEach((col) => {
        if (!columns.includes(col)) {
          delete this.residueSettings[col]
        }
      })
    },

    // Update conditions for a residue column
    setResidueConditions(residueColumn, conditions) {
      if (this.residueSettings[residueColumn]) {
        this.residueSettings[residueColumn].conditions = conditions
      }
    },

    // Update color scale settings for a residue column
    setColorScale(residueColumn, colorScale) {
      if (this.residueSettings[residueColumn]) {
        this.residueSettings[residueColumn].colorScale = {
          ...this.residueSettings[residueColumn].colorScale,
          ...colorScale,
        }
      }
    },
  },
})
