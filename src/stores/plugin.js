import { markRaw } from 'vue'
import { defineStore } from 'pinia'
import { createPluginUI } from 'molstar/lib/mol-plugin-ui'
import { renderReact18 } from 'molstar/lib/mol-plugin-ui/react18'
import { MolstarPluginOperations } from '@/services/molstar/operations'
import { MolstarPluginConfig } from '@/services/molstar/config'

export const usePluginStore = defineStore('plugin', {
  state: () => ({
    plugin: null,
    initializationStatus: 'idle',
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
          spec: MolstarPluginConfig.getDefaultConfig(),
          render: renderReact18,
        })
        // !! The plugin object is not compatible with Vue's reactivity system
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
      return await MolstarPluginOperations.loadStructures(this.plugin, structures)
    },

    registerCustomElement(element) {
      if (!this.plugin) return
      MolstarPluginOperations.registerCustomElement(this.plugin, element)
    },
  },
})
