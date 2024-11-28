/**
 * Mol* Custom Element Functions
 *
 * A collection of functions to generate molstar custom elements.
 *
 */
import { CustomElementProperty } from 'molstar/lib/mol-model-props/common/custom-element-property'
import { Color } from 'molstar/lib/mol-util/color'
import { generateSequentialColorScale } from '@/utils/scales/color-scales'

export const PluginElementService = {
  /**
   * Creates a custom residue coloring element for Mol*
   * @param {Object} params Configuration parameters
   * @param {string} params.name The property name (e.g. 'max_mut_escape-REGN10933')
   * @param {Array} params.processedData Array of processed residue data objects
   * @returns {CustomElementProperty} Configured custom element property
   */
  createResidueColoring({ name, processedData }) {
    if (!processedData?.length || !name) {
      throw new Error('Both data and name are required. One is missing or empty.')
    }

    // Generate color scale from processed data
    const residueColorScale = generateSequentialColorScale(processedData, 'value')

    // Create a nested map structure: model -> chain -> residue -> value
    const dataMap = new Map()
    processedData.forEach((entry) => {
      // Split models and their corresponding chains
      const [models, chains] = [entry.model.split(':'), entry.chain.split(':')]

      // Process each model and its corresponding chain group
      models.forEach((model, modelIndex) => {
        if (!dataMap.has(model)) {
          dataMap.set(model, new Map())
        }

        // Get the chains for this model
        const modelChains = chains[modelIndex].split(';')

        // For each chain in this model, store the residue value
        modelChains.forEach((chain) => {
          if (!dataMap.get(model).has(chain)) {
            dataMap.get(model).set(chain, new Map())
          }
          dataMap.get(model).get(chain).set(entry.residue, entry.value)
        })
      })
    })

    console.log(dataMap)

    // Parse name into readable label
    const [column, condition] = name.split('-')
    const label = condition ? `${column} for ${condition}` : column

    return CustomElementProperty.create({
      label,
      name,

      async getData(model) {
        // Skip if no data for this model
        const modelId = model.entryId.toUpperCase()
        if (!dataMap.has(modelId)) return { value: new Map() }

        const residueColorMap = new Map()
        const { _rowCount: residueCount } = model.atomicHierarchy.residues
        const { offsets: residueOffsets } = model.atomicHierarchy.residueAtomSegments
        const chainIndex = model.atomicHierarchy.chainAtomSegments.index

        for (let rI = 0; rI < residueCount; rI++) {
          const cI = chainIndex[residueOffsets[rI]]
          const chainId = model.atomicHierarchy.chains.auth_asym_id.value(cI)
          const residueId = model.atomicHierarchy.residues.auth_seq_id.value(rI)

          // Check if we have data for this chain and residue
          const chainMap = dataMap.get(modelId).get(chainId)
          if (!chainMap || !chainMap.has(residueId)) continue

          const value = chainMap.get(residueId)

          // Map value to all atoms in residue
          for (let aI = residueOffsets[rI]; aI < residueOffsets[rI + 1]; aI++) {
            residueColorMap.set(aI, value)
          }
        }

        return { value: residueColorMap }
      },
      coloring: {
        getColor(value) {
          return Color.fromHexStyle(residueColorScale(value))
        },
        defaultColor: Color(0x777777),
      },

      getLabel(value) {
        return `${label}: ${value}`
      },
    })
  },

  /**
   * Generates multiple custom elements for all provided residue data
   * @param {Object} residueData Object with property name keys and processed data array values
   * @returns {Array} Array of custom element properties
   */
  generateCustomElements(residueData) {
    if (!residueData || Object.keys(residueData).length === 0) {
      throw new Error('Residue data is required.')
    }

    return Object.entries(residueData).map(([name, processedData]) =>
      this.createResidueColoring({
        name,
        processedData,
      }),
    )
  },
}
