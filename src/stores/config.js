import { defineStore } from 'pinia'
import { useDataStore } from './data'

export const useConfigStore = defineStore('config', {
  state: () => ({
    // Core configuration
    residueColumns: ['region'], // Selected columns containing residue-level data
    conditions: [], // Selected conditions to visualize
    // Color scale configurations keyed by column-condition combination
    colorScaleConfigs: {
      region: {
        scaleType: 'categorical',
        scheme: 'tableau10',
        unknownColor: '#777777',
      },
    },
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
    /**
     * Get color scale config for a specific column-condition combination
     */
    getColorScaleConfig: (state) => (column, condition) => {
      const key = condition ? `${column}-${condition}` : column
      return (
        state.colorScaleConfigs[key] || {
          scaleType: 'sequential', // Default to sequential
          scheme: state.visualSettings.defaultColorSchemes.sequential,
        }
      )
    },

    /**
     * Get all active color scale configurations
     */
    activeColorScaleConfigs: (state) => {
      const configs = {}

      state.residueColumns.forEach((column) => {
        if (state.conditions.length) {
          state.conditions.forEach((condition) => {
            const key = `${column}-${condition}`
            configs[key] = state.colorScaleConfigs[key] || {
              scaleType: 'sequential',
              scheme: state.visualSettings.defaultColorSchemes.sequential,
            }
          })
        } else {
          configs[column] = state.colorScaleConfigs[column] || {
            scaleType: 'sequential',
            scheme: state.visualSettings.defaultColorSchemes.sequential,
          }
        }
      })

      return configs
    },
  },

  actions: {
    /**
     * Update color scale configuration for a specific column-condition combination
     */
    updateColorScaleConfig(column, condition, config) {
      const key = condition ? `${column}-${condition}` : column
      this.colorScaleConfigs[key] = {
        ...this.colorScaleConfigs[key],
        ...config,
      }
    },

    /**
     * Reset color scale configuration to defaults
     */
    resetColorScaleConfig(column, condition) {
      const key = condition ? `${column}-${condition}` : column
      delete this.colorScaleConfigs[key]
    },
  },
})
