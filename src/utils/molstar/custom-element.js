import { CustomElementProperty } from 'molstar/lib/mol-model-props/common/custom-element-property'
import { Color } from 'molstar/lib/mol-util/color'
import { generateSequentialColorScale } from '@/utils/scales/color-scales'
import { processResidueData } from '@/utils/data/process-input-data'

/**
 * Factory function to create a CustomElementProperty for Mol*.
 *
 * @param {string} column - The metric column to aggregate.
 * @param {string} [condition] - The condition column to filter on (optional).
 * @param {Array} rawData - The input raw data array.
 * @returns {CustomElementProperty} - A configured CustomElementProperty.
 */
export function createCustomResidueColoring(column, condition, rawData) {
  if (!rawData || !column) {
    throw new Error('Both rawData and column are required.')
  }

  // Process residue data for the given column and condition
  const processedData = processResidueData(rawData, column, condition)

  // Generate a color scale based on the processed data
  const residueColorScale = generateSequentialColorScale(processedData, 'value')

  return CustomElementProperty.create({
    label: `${column}${condition ? ` for ${condition}` : ''}`,
    name: `${condition ? `${condition}-${column}` : column}`,
    async getData(model) {
      const residueColorMap = new Map()

      // Map processed data for quick lookup
      const dataMap = processedData.reduce((map, entry) => {
        const key = `${entry.chain}:${entry.residue}`
        map.set(key, entry.value)
        return map
      }, new Map())

      const { _rowCount: residueCount } = model.atomicHierarchy.residues
      const { offsets: residueOffsets } = model.atomicHierarchy.residueAtomSegments
      const chainIndex = model.atomicHierarchy.chainAtomSegments.index

      for (let rI = 0; rI < residueCount; rI++) {
        const cI = chainIndex[residueOffsets[rI]]
        const key = `${model.atomicHierarchy.chains.auth_asym_id.value(cI)}:${model.atomicHierarchy.residues.auth_seq_id.value(rI)}`

        if (!dataMap.has(key)) continue
        const ann = dataMap.get(key)

        for (let aI = residueOffsets[rI]; aI < residueOffsets[rI + 1]; aI++) {
          residueColorMap.set(aI, ann)
        }
      }
      console.log(residueColorMap)
      return { value: residueColorMap }
    },
    coloring: {
      getColor(value) {
        // Use the custom color scale based on the provided column
        console.log(value)
        console.log(residueColorScale(value))
        return Color.fromHexStyle(residueColorScale(value))
      },
      defaultColor: Color(0x777777), // Default color for residues without data
    },
    getLabel(value) {
      return `${column} Score: ${value}`
    },
  })
}
