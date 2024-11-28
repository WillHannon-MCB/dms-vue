/**
 * A collection of functions to generate Mol* custom element properties.
 */
import { CustomElementProperty } from 'molstar/lib/mol-model-props/common/custom-element-property'
import { Color } from 'molstar/lib/mol-util/color'
import {
  generateSequentialColorScale,
  generateDivergingColorScale,
  generateCategoricalColorScale,
} from '@/utils/scales/color-scales'

export const PluginElementService = {
  /**
   * Creates a data map structure for efficient lookups
   * @param {Array} processedData - The processed data array.
   * @returns {Map} - The data map.
   */
  _createDataMap: (processedData) => {
    const dataMap = new Map()

    processedData.forEach((entry) => {
      const [models, chains] = [entry.model.split(':'), entry.chain.split(':')]

      models.forEach((model, modelIndex) => {
        if (!dataMap.has(model)) {
          dataMap.set(model, new Map())
        }

        const modelChains = chains[modelIndex].split(';')
        modelChains.forEach((chain) => {
          if (!dataMap.get(model).has(chain)) {
            dataMap.get(model).set(chain, new Map())
          }
          dataMap.get(model).get(chain).set(entry.residue, entry.value)
        })
      })
    })

    return dataMap
  },

  /**
   * Creates a color scale based on data and scale configuration
   * @param {Array} data - The processed data array.
   * @param {Object} scaleConfig - The scale configuration object.
   * @returns {Function} - The D3 scale function.
   */
  _createColorScale: (data, scaleConfig) => {
    const { scaleType = 'sequential', ...config } = scaleConfig

    switch (scaleType) {
      case 'sequential':
        return generateSequentialColorScale(data, 'value', config)
      case 'diverging':
        return generateDivergingColorScale(data, 'value', config)
      case 'categorical':
        return generateCategoricalColorScale(data, 'value', config)
      default:
        console.warn(`Unknown scale type: ${scaleType}, falling back to sequential`)
        return generateSequentialColorScale(data, 'value', config)
    }
  },

  /**
   * Maps residue data to atom indices for a given model
   * @param {Object} model - The Mol* model object.
   * @param {Map} dataMap - The data map structure.
   * @returns {Map} - The residue-color map.
   */
  _mapResiduesToAtoms: async (model, dataMap) => {
    const modelId = model.entryId.toUpperCase()
    if (!dataMap.has(modelId)) return new Map()

    const residueColorMap = new Map()
    const { _rowCount: residueCount } = model.atomicHierarchy.residues
    const { offsets: residueOffsets } = model.atomicHierarchy.residueAtomSegments
    const chainIndex = model.atomicHierarchy.chainAtomSegments.index

    for (let rI = 0; rI < residueCount; rI++) {
      const cI = chainIndex[residueOffsets[rI]]
      const chainId = model.atomicHierarchy.chains.auth_asym_id.value(cI)
      const residueId = model.atomicHierarchy.residues.auth_seq_id.value(rI)

      const chainMap = dataMap.get(modelId).get(chainId)
      if (!chainMap || !chainMap.has(residueId)) continue

      const value = chainMap.get(residueId)

      for (let aI = residueOffsets[rI]; aI < residueOffsets[rI + 1]; aI++) {
        residueColorMap.set(aI, value)
      }
    }

    return residueColorMap
  },

  /**
   * Creates a single custom residue coloring element
   * @param {Object} options - The coloring options.
   * @param {string} options.name - The name of the coloring element (column-condition).
   * @param {Array} options.processedData - The processed data array from ResidueDataService.
   * @param {Object} [options.scaleConfig] - The scale configuration object.
   * @param {number} [options.defaultColor] - The default color value for residues with no data.
   * @returns {CustomElementProperty} - The custom element property
   * @throws {Error} - If required options are missing.
   */
  createResidueColoring: ({ name, processedData, scaleConfig = {}, defaultColor = 0x777777 }) => {
    if (!processedData?.length || !name) {
      throw new Error('Both data and name are required.')
    }

    const dataMap = PluginElementService._createDataMap(processedData)
    const colorScale = PluginElementService._createColorScale(processedData, scaleConfig)

    const [column, condition] = name.split('-')
    const label = condition ? `${column} for ${condition}` : column

    return CustomElementProperty.create({
      label,
      name,

      async getData(model) {
        const residueColorMap = await PluginElementService._mapResiduesToAtoms(model, dataMap)
        return { value: residueColorMap }
      },

      coloring: {
        getColor(value) {
          return Color.fromHexStyle(colorScale(value))
        },
        defaultColor: Color(defaultColor),
      },

      getLabel(value) {
        return `${label}: ${value}`
      },
    })
  },

  /**
   * Generates multiple custom elements
   * @param {Object} residueDataMap - The residue data map.
   * @param {Object} [scaleConfigs] - The scale configuration object.
   * @returns {Array<CustomElementProperty>} - The custom element properties.
   * @throws {Error} - If residue data is missing.
   */
  generateCustomElements: (residueDataMap, scaleConfigs = {}) => {
    if (!residueDataMap || Object.keys(residueDataMap).length === 0) {
      throw new Error('Residue data is required.')
    }

    return Object.entries(residueDataMap).map(([name, processedData]) => {
      return PluginElementService.createResidueColoring({
        name,
        processedData,
        scaleConfig: scaleConfigs[name] || {},
      })
    })
  },
}
