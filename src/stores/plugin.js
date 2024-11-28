import { markRaw } from 'vue'
import { defineStore } from 'pinia'
import { createPluginUI } from 'molstar/lib/mol-plugin-ui'
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18'
import { PluginOperationsService } from '@/services/molstar/pluginOperationsService'
import { PluginConfigService } from '@/services/molstar/pluginConfigService'

export const usePluginStore = defineStore('plugin', {
  state: () => ({
    plugin: null,
    initializationStatus: 'idle',
    registeredElements: [],
  }),

  getters: {
    isInitialized: (state) => !!state.plugin,
  },

  actions: {
    async initialize(container) {
      this.initializationStatus = 'initializing'
      try {
        const plugin = await createPluginUI({
          target: container,
          spec: PluginConfigService.getDefaultConfig(),
          render: renderReact18,
        })
        // Prevent Vue reactivity on the plugin object
        this.plugin = markRaw(plugin)
        this.initializationStatus = 'ready'
      } catch (err) {
        console.error('Plugin store: Initialization failed', err)
        this.initializationStatus = 'error'
        throw err
      }
    },

    async loadStructures(structures) {
      if (!this.plugin) return false
      return await PluginOperationsService.loadStructures(this.plugin, structures)
    },

    registerCustomElements(elements) {
      if (!this.plugin) return false

      // Clear existing elements
      this.clearCustomElements()

      // Register new elements
      const success = PluginOperationsService.registerCustomElements(this.plugin, elements)
      if (success) {
        this.registeredElements = elements
      }
      return success
    },

    clearCustomElements() {
      if (!this.plugin) return false
      const success = PluginOperationsService.clearCustomElements(this.plugin)
      if (success) {
        this.registeredElements = []
      }
      return success
    },
  },
})
