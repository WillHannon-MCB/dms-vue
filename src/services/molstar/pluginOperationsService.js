/**
 * A collection of operations to related to the Mol* plugin instance.
 */
import { Asset } from 'molstar/lib/mol-util/assets'

export const PluginOperationsService = {
  /**
   * Load a single structure into the plugin
   * @param {object} plugin - Mol* plugin instance
   * @param {object} structure - Structure data object
   * @param {string} [structure.url] - URL of the structure file
   * @param {string} [structure.format='mmcif'] - Format of the structure file
   * @param {string} [structure.assemblyId=''] - Assembly ID of the structure
   * @param {boolean} [structure.isBinary=false] - Whether the structure is binary
   * @returns {Promise<boolean>} - Success status of the operation
   * @throws {Error} - If plugin instance is not initialized
   * @throws {Error} - If structure loading fails
   */
  async loadStructure(plugin, { url, format = 'mmcif', assemblyId = '', isBinary = false }) {
    if (!plugin) throw new Error('Plugin instance is not initialized')
    try {
      // 1. Download raw molecular data
      const data = await plugin.builders.data.download(
        { url: Asset.Url(url), isBinary },
        { state: { isGhost: true } },
      )
      // 2. Parse the data into a trajectory
      const trajectory = await plugin.builders.structure.parseTrajectory(data, format)
      // 3. Create a structure from the trajectory
      await plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default', {
        structure: assemblyId
          ? {
              name: 'assembly',
              params: { id: assemblyId },
            }
          : {
              name: 'model',
              params: {},
            },
        showUnitcell: false,
        representationPreset: 'auto',
      })
      return true
    } catch (error) {
      console.error(`Failed to load structure from ${url}:`, error)
      return false
    }
  },

  /**
   * Load multiple structures into the plugin
   * @param {object} plugin - Mol* plugin instance
   * @param {object[]} structures - Array of structure data objects (see loadStructure)
   * @returns {Promise<boolean>} - Success status of the operation
   * @throws {Error} - If plugin instance is not initialized
   */
  async loadStructures(plugin, structures) {
    if (!plugin) throw new Error('Plugin instance is not initialized')

    plugin.clear()

    const results = await Promise.all(
      structures.map((structure) => this.loadStructure(plugin, structure)),
    )

    return results.every((result) => result)
  },

  /**
   * Register a custom element with the plugin's visualization systems
   * @param {object} plugin - Mol* plugin instance
   * @param {object} customElement - Custom element object
   * @returns {boolean} - Success status of the operation
   * @throws {Error} - If plugin instance is not initialized
   * @throws {Error} - If registration fails
   */
  registerCustomElement(plugin, customElement) {
    if (!plugin) throw new Error('Plugin instance is not initialized')

    try {
      plugin.representation.structure.themes.colorThemeRegistry.add(
        customElement.colorThemeProvider,
      )
      plugin.managers.lociLabels.addProvider(customElement.labelProvider)
      plugin.customModelProperties.register(customElement.propertyProvider, true)
      return true
    } catch (error) {
      console.error('Failed to register custom element:', error)
      return false
    }
  },

  /**
   * Register multiple custom elements
   * @param {object} plugin - Mol* plugin instance
   * @param {object[]} customElements - Array of custom element objects
   * @returns {boolean} - Success status of the operation
   */
  registerCustomElements(plugin, customElements) {
    if (!Array.isArray(customElements)) {
      customElements = Object.values(customElements)
    }

    return customElements.every((element) => this.registerCustomElement(plugin, element))
  },

  /**
   * Clear all registered custom elements and visualizations
   * @param {object} plugin - Mol* plugin instance
   * @returns {boolean} - Success status of the operation
   * @throws {Error} - If plugin instance is not initialized
   * @throws {Error} - If clearing fails
   */
  clearCustomElements(plugin) {
    if (!plugin) throw new Error('Plugin instance is not initialized')
    try {
      plugin.representation.structure.themes.colorThemeRegistry.clear()
      return true
    } catch (error) {
      console.error('Failed to clear custom elements:', error)
      return false
    }
  },
}
