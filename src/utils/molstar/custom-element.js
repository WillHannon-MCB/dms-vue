/**
 * Create a Mol* custom element with residue color and label
 * https://github.com/molstar/molstar/blob/master/src/mol-model-props/common/custom-element-property.ts
 */

/**
 * Define a custom element property for Mol* plugin to color residues
 *
 * Example using data to color residues based on their index:
 * https://github.com/molstar/molstar/blob/master/src/examples/proteopedia-wrapper/annotation.ts
 *
 */

import { CustomElementProperty } from 'molstar/lib/mol-model-props/common/custom-element-property'
import { Color } from 'molstar/lib/mol-util/color'
import { generateSequentialColorScale } from '@/utils/scales/color-scales'
import { processExampleData } from '@/utils/data/process-input-data'
import residueData from '@/assets/data/residueData.json'

const condition = 'REGN10987'
const metric = 'mean_mut_escape'
const processedData = processExampleData(residueData, condition, metric)
const residueColorScale = generateSequentialColorScale(processedData, metric)

const CustomResidueColoring = CustomElementProperty.create({
  label: `${metric} for ${condition}`,
  name: `${condition}-${metric}`,
  async getData(model) {
    const residueColorMap = new Map()

    const dataMap = processedData.reduce((map, entry) => {
      const key = `${entry.chain}:${entry.site}`
      map.set(key, entry.mean_mut_escape)
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
    return { value: residueColorMap }
  },
  coloring: {
    getColor(value) {
      // Use the custom color scale based on `mean_mut_escape`
      return Color.fromHexStyle(residueColorScale(value))
    },
    defaultColor: Color(0x777777), // Default color for residues without data
  },
  getLabel(value) {
    return `Escape Score: ${value.toFixed(4)}`
  },
})

export default CustomResidueColoring
