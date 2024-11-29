/**
 * State logic for Mol* viewer plugin
 */
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { usePluginStore } from '@/stores/plugin'
import { useDataStore } from '@/stores/data'

export function useMolstarPlugin(containerRef) {
  // Stores
  const pluginStore = usePluginStore()
  const dataStore = useDataStore()

  // State
  const error = ref(null)
  const activeStructures = ref([])
  let cleanup = null

  // Utils
  const handleError = (errorMessage, err) => {
    error.value = {
      message: errorMessage,
      details: err?.message || 'Unknown error',
      timestamp: new Date(),
    }
    console.error(errorMessage, err)
  }

  const clearError = () => {
    error.value = null
  }

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

  // Reactivity
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

  // Lifecylce Hooks
  onBeforeUnmount(() => {
    if (cleanup) {
      cleanup()
    }
    pluginStore.$reset()
  })

  onMounted(async () => {
    await initializePlugin()
  })

  return {
    // State
    isInitialized: pluginStore.isInitialized,
    error,
    activeStructures,

    // Methods
    clearError,
  }
}
