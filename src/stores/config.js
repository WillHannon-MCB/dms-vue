import { defineStore } from 'pinia'

export const useConfigStore = defineStore('config', {
  state: () => ({
    residueColumns: ['max_mut_escape'], // Hardcoded example columns
  }),

  getters: {
    selectedResidueColumns(state) {
      return state.residueColumns
    },
  },
})
