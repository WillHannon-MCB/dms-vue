/**
 * Define a custom element property for Mol* plugin to color residues
 *
 * Example using data to color residues based on their index:
 * https://github.com/molstar/molstar/blob/master/src/examples/proteopedia-wrapper/annotation.ts
 *
 */

import { CustomElementProperty } from 'molstar/lib/mol-model-props/common/custom-element-property'
import { Color } from 'molstar/lib/mol-util/color'
import { generateCategoricalColorScale } from '@/utils/colorScales'

const categories = [0, 1]
const colors = ['#e8eb34', '#3d34eb']
const categoricalScale = generateCategoricalColorScale(categories, colors)

const StripedResidues = CustomElementProperty.create({
  label: 'Residue Stripes',
  name: 'basic-wrapper-residue-striping',
  getData(model) {
    const map = new Map()
    const residueIndex = model.atomicHierarchy.residueAtomSegments.index
    for (let i = 0, _i = model.atomicHierarchy.atoms._rowCount; i < _i; i++) {
      map.set(i, residueIndex[i] % 2)
    }
    return { value: map }
  },
  coloring: {
    getColor(e) {
      return Color.fromHexStyle(categoricalScale(e))
    },
    defaultColor: Color(0x777777),
  },
  getLabel(e) {
    return e === 0 ? 'Odd stripe' : 'Even stripe'
  },
})

export default StripedResidues
