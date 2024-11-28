import { ref, watch } from 'vue'
import { usePluginStore } from '@/stores/plugin'
import { useDataStore } from '@/stores/data'
import { useConfigStore } from '@/stores/config'
import { PluginElementService } from '@/services/molstar/pluginElementService'
import { ResidueDataService } from '@/services/data/residueDataService'

export function useMolstarColoring() {
  // Stores
  const pluginStore = usePluginStore()
  const dataStore = useDataStore()
  const configStore = useConfigStore()
  // State
  const error = ref(null)

  // Helper to clear error state
  const clearError = () => {
    error.value = null
  }

  // Helper to handle errors consistently
  const handleError = (message, err = null) => {
    error.value = {
      message,
      details: err?.message || 'Unknown error',
      timestamp: new Date(),
    }
    console.error(message, err)
  }

  /**
   * Creates column configs array from columns and conditions
   * @param {Array<string>} columns - Array of column names
   * @param {Array<string>} conditions - Array of conditions
   * @returns {Array<{column: string, condition?: string}>}
   */
  const createColumnConfigs = (columns, conditions) => {
    // If no conditions, just map columns directly
    if (!conditions?.length) {
      return columns.map((column) => ({ column }))
    }
    // Create a config for each column-condition combination
    return columns.flatMap((column) => {
      return conditions.map((condition) => ({
        column,
        condition,
      }))
    })
  }

  // Watch for changes that should trigger custom element updates
  watch(
    [() => dataStore.data, () => configStore.residueColumns, () => configStore.conditions],
    async ([data, columns, conditions]) => {
      if (!pluginStore.plugin || !data || !columns.length) return

      try {
        clearError()

        // 1. Create column configs from columns and conditions
        const columnConfigs = createColumnConfigs(columns, conditions)

        // 2. Process the input data into residue-level data
        const residueData = ResidueDataService.processResidueData(data, columnConfigs)

        // 3. Generate custom elements from the processed data
        const elements = PluginElementService.generateCustomElements(residueData)

        // 4. Register with plugin
        const success = pluginStore.registerCustomElements(elements)

        if (!success) {
          handleError('Failed to register some custom elements')
        }
      } catch (err) {
        handleError('Failed to update custom elements', err)
      }
    },
    { deep: true },
  )

  return {
    error,
    clearError,
  }
}
