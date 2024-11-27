import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { usePluginStore } from '@/stores/plugin'
import { useDataStore } from '@/stores/data'
import { useConfigStore } from '@/stores/config'
import { useColorStore } from '@/stores/color'

export function useMolstarPlugin(containerRef) {
  // Stores
  const pluginStore = usePluginStore()
  const dataStore = useDataStore()
  const configStore = useConfigStore()
  const colorStore = useColorStore()

  // State
  const error = ref(null)
  const activeStructures = ref([])
  const activeCustomElements = ref([])

  // Track cleanup function
  let cleanup = null

  // Error handling helper
  const handleError = (errorMessage, err) => {
    error.value = {
      message: errorMessage,
      details: err?.message || 'Unknown error',
      timestamp: new Date(),
    }
    console.error(errorMessage, err)
  }

  // Clear error helper
  const clearError = () => {
    error.value = null
  }

  // Initialize plugin
  const initializePlugin = async () => {
    if (!containerRef.value) {
      console.error('Composable: Container reference not available')
      return
    }
    try {
      await pluginStore.initialize(containerRef.value)
    } catch (err) {
      console.error('Composable: Initialization failed', err)
    }
  }

  // Structure watcher
  watch(
    () => dataStore.structures,
    async (newStructures) => {
      if (!pluginStore.plugin || !newStructures.length) {
        return
      }

      try {
        clearError()
        const success = await pluginStore.loadStructures(newStructures)
        if (success) {
          activeStructures.value = newStructures
        } else {
          handleError('Some structures failed to load')
        }
      } catch (err) {
        handleError('Failed to load structures', err)
      } finally {
        console.log('Structure loading complete')
      }
    },
    { immediate: true },
  )

  // Custom elements watcher
  watch(
    () => colorStore.customElements,
    (customElements) => {
      if (!pluginStore.plugin || !customElements) return

      try {
        clearError()
        Object.values(customElements).forEach((element) => {
          pluginStore.registerCustomElement(element)
        })
        activeCustomElements.value = Object.keys(customElements)
      } catch (err) {
        handleError('Failed to register custom elements', err)
      }
    },
    { deep: true },
  )

  // Data and config watcher
  watch([() => dataStore.data, () => configStore.residueColumns], ([data, residueColumns]) => {
    if (data && residueColumns.length) {
      try {
        clearError()
        colorStore.generateCustomElements()
      } catch (err) {
        handleError('Failed to generate custom elements', err)
      }
    }
  })

  // Register cleanup at the top level
  onBeforeUnmount(() => {
    if (cleanup) {
      cleanup()
    }
    pluginStore.$reset()
  })

  // Initialize on mount
  onMounted(async () => {
    await initializePlugin()
  })

  return {
    // State
    isInitialized: pluginStore.isInitialized,
    error,
    activeStructures,
    activeCustomElements,

    // Methods
    clearError,
  }
}
