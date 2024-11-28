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
      throw new Error('Both processedData and name are required.')
    }

    // Generate color scale from processed data
    const residueColorScale = generateSequentialColorScale(processedData, 'value')

    // Create lookup map for residue data
    const dataMap = new Map(
      processedData.map((entry) => [`${entry.chain}:${entry.residue}`, entry.value]),
    )

    // Parse name into readable label
    const [column, condition] = name.split('-')
    const label = condition ? `${column} for ${condition}` : column

    return CustomElementProperty.create({
      label,
      name,

      async getData(model) {
        const residueColorMap = new Map()
        const { _rowCount: residueCount } = model.atomicHierarchy.residues
        const { offsets: residueOffsets } = model.atomicHierarchy.residueAtomSegments
        const chainIndex = model.atomicHierarchy.chainAtomSegments.index

        for (let rI = 0; rI < residueCount; rI++) {
          const cI = chainIndex[residueOffsets[rI]]
          const key = `${model.atomicHierarchy.chains.auth_asym_id.value(cI)}:${model.atomicHierarchy.residues.auth_seq_id.value(rI)}`

          if (!dataMap.has(key)) continue
          const value = dataMap.get(key)

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
