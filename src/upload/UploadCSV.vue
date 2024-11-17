<template>
  <div class="p-4 bg-white">
    <h2 class="text-lg font-semibold mb-4">Upload Your CSV:</h2>
    <form @submit.prevent="handleFileUpload" class="flex items-center gap-4 border border-gray-300 rounded-lg p-2">
      <!-- Custom File Input -->
      <div class="relative flex-grow">
        <label for="file-upload"
          class="block px-4 py-2 bg-gray-100 text-gray-900 rounded-lg cursor-pointer border border-gray-300 focus:ring focus:ring-blue-300 hover:bg-gray-200">
          Choose File
        </label>
        <input id="file-upload" type="file" accept=".csv" @change="onFileChange"
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>

      <!-- File Name Display -->
      <div class="flex-grow text-gray-700 text-sm bg-gray-50 px-4 py-2 rounded-md border border-gray-300">
        {{ selectedFileName || "No file chosen" }}
      </div>

      <!-- Upload Button -->
      <button type="submit"
        class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:ring focus:ring-blue-300"
        :disabled="!selectedFile">
        Upload
      </button>
    </form>

    <!-- Success or Error Messages -->
    <p v-if="successMessage" class="mt-4 text-green-500">{{ successMessage }}</p>
    <p v-if="error" class="mt-4 text-red-500">{{ error }}</p>
  </div>
</template>

<script>
import { ref } from "vue";
import { parseCsvData } from "@/utils/data/process-input-data";

export default {
  name: "UploadCSV",
  emits: ["csv-processed"],
  setup(_, { emit }) {
    const selectedFile = ref(null);
    const selectedFileName = ref("No file chosen");
    const error = ref("");
    const successMessage = ref("");

    // Handle file selection
    const onFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        if (file.type === "text/csv") {
          selectedFile.value = file;
          selectedFileName.value = file.name; // Update file name
          error.value = "";
          successMessage.value = ""; // Clear previous success message
        } else {
          error.value = "Please upload a valid CSV file.";
          selectedFileName.value = "No file chosen"; // Reset file name
          successMessage.value = ""; // Clear success message
        }
      }
      // Reset the input value to allow re-uploading the same file
      event.target.value = null;
    };

    // Handle file upload
    const handleFileUpload = async () => {
      if (!selectedFile.value) return;

      try {
        const text = await selectedFile.value.text();
        const parsedData = parseCsvData(text); // Process the CSV data
        emit("csv-processed", parsedData); // Emit the parsed data
        successMessage.value = `Success! Viewing data ${selectedFileName.value}`; // Show success message
        selectedFile.value = null; // Reset the selected file
        selectedFileName.value = "No file chosen"; // Reset file name display
        error.value = ""; // Clear any previous error
      } catch (err) {
        error.value = "Error processing CSV: " + err.message;
        successMessage.value = ""; // Clear success message
      }
    };

    return {
      selectedFile,
      selectedFileName,
      error,
      successMessage,
      onFileChange,
      handleFileUpload,
    };
  },
};
</script>
