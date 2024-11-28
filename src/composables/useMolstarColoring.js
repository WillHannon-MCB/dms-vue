import { ref, watch } from 'vue'
import { usePluginStore } from '@/stores/plugin'
import { useDataStore } from '@/stores/data'
import { useConfigStore } from '@/stores/config'
import { PluginElementService } from '@/services/molstar/pluginElementService'
import { ResidueDataService } from '@/services/data/residueDataService'

export function useMolstarColoring() {
  const pluginStore = usePluginStore()
  const dataStore = useDataStore()
  const configStore = useConfigStore()
  const error = ref(null)

  const clearError = () => {
    error.value = null
  }

  const handleError = (message, err = null) => {
    error.value = {
      message,
      details: err?.message || 'Unknown error',
      timestamp: new Date(),
    }
    console.error(message, err)
  }

  const createColumnConfigs = (columns, conditions) => {
    if (!conditions?.length) {
      return columns.map((column) => ({ column }))
    }
    return columns.flatMap((column) =>
      conditions.map((condition) => ({
        column,
        condition,
      })),
    )
  }

  watch(
    [
      () => dataStore.data,
      () => configStore.residueColumns,
      () => configStore.conditions,
      () => configStore.colorScaleConfigs,
    ],
    async ([data, columns, conditions, scaleConfigs]) => {
      if (!pluginStore.plugin || !data || !columns.length) return

      try {
        clearError()

        const columnConfigs = createColumnConfigs(columns, conditions)
        const residueData = ResidueDataService.processResidueData(data, columnConfigs)

        console.log(
          'Debug [useMolstarColoring]: Generating custom elements with scale configs:',
          scaleConfigs,
        )

        // Pass scale configurations to generateCustomElements
        const elements = PluginElementService.generateCustomElements(
          residueData,
          scaleConfigs || {},
        )

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
