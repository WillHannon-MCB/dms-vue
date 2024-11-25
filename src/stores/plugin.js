import { toRaw } from 'vue'
import { defineStore } from 'pinia'
import { useDataStore } from '@/stores/data'
import { useConfigStore } from '@/stores/config'
import { createCustomResidueColoring } from '@/utils/molstar/custom-element'

export const useColorStore = defineStore('color', {
  state: () => ({
    customElements: {},
  }),

  actions: {
    generateCustomElements() {
      const dataStore = useDataStore()
      const configStore = useConfigStore()

      if (!dataStore.rawData || !configStore.residueColumns.length) {
        console.warn('Data or configuration is missing. Cannot generate custom elements.')
        return
      }

      // Access raw (non-proxy) data
      const rawData = toRaw(dataStore.rawData)

      const residueColumns = configStore.residueColumns
      const conditions = dataStore.conditions.length ? dataStore.conditions : [null]

      residueColumns.forEach((column) => {
        conditions.forEach((condition) => {
          const key = condition ? `${condition}-${column}` : column
          console.log('Generating custom element:', key)

          const customElement = createCustomResidueColoring(column, condition, rawData)
          this.customElements[key] = customElement
        })
      })
    },
  },
})
