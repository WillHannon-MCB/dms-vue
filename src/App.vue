<template>
  <div>
    <nav class="bg-gray-800 p-4">
      <div class="flex space-x-4">
        <RouterLink to="/" class="text-gray-300 hover:text-white px-3 py-2 rounded-md"
          :class="{ 'bg-gray-900': $route.path === '/' }">
          Upload
        </RouterLink>

        <RouterLink to="/configure" class="text-gray-300 hover:text-white px-3 py-2 rounded-md"
          :class="{ 'bg-gray-900': $route.path === '/configure' }">
          Configure
        </RouterLink>

        <RouterLink to="/visualize" class="text-gray-300 hover:text-white px-3 py-2 rounded-md"
          :class="{ 'bg-gray-900': $route.path === '/visualize' }">
          Visualize
        </RouterLink>

        <RouterLink to="/export" class="text-gray-300 hover:text-white px-3 py-2 rounded-md"
          :class="{ 'bg-gray-900': $route.path === '/export' }">
          Export
        </RouterLink>
      </div>
    </nav>

    <main class="p-5">
      <RouterView />
    </main>
  </div>
</template>
