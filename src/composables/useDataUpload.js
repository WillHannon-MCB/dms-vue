/**
 * State logic for uploading CSV data files
 */
import { ref } from 'vue'
import { useDataStore } from '@/stores/data'

export function useFileUpload() {
  // Store
  const store = useDataStore()

  // State
  const file = ref(null)
  const fileName = ref('No file chosen')

  // Utils
  const handleFileSelect = (event) => {
    const selectedFile = event.target.files[0]
    if (selectedFile?.type === 'text/csv') {
      file.value = selectedFile
      fileName.value = selectedFile.name
    } else {
      file.value = null
      fileName.value = 'No file chosen'
    }
  }

  const uploadFile = async () => {
    if (!file.value) return

    try {
      const text = await file.value.text()
      await store.processData(text)
      file.value = null
      fileName.value = 'No file chosen'
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  return {
    file,
    fileName,
    handleFileSelect,
    uploadFile,
  }
}
