import { defineStore } from 'pinia'
import { parseCsvData, validateCsvData } from '@/utils/data/process-input-data'

export const useDataStore = defineStore('data', {
  state: () => ({
    rawData: null,
    successMessage: '',
    errorMessage: '',
  }),

  actions: {
    async uploadData(csvText, residueLevelDataColumns = [], fileName = null) {
      try {
        // Parse the CSV data
        const parsedData = parseCsvData(csvText)
        // Validate the parsed data
        validateCsvData(parsedData, residueLevelDataColumns)
        // Update the store with valid data
        this.rawData = parsedData
        this.successMessage = fileName
          ? `File "${fileName}" uploaded and validated successfully!`
          : 'Data uploaded and validated successfully!'
        this.errorMessage = ''
      } catch (error) {
        this.rawData = null
        this.successMessage = ''
        this.errorMessage = `Error processing CSV: ${error.message}`
        throw error
      }
    },
  },
})
