/**
 * Define a custom element property for Mol* plugin to color residues
 */

import { CustomElementProperty } from 'molstar/lib/mol-model-props/common/custom-element-property'
import { Color } from 'molstar/lib/mol-util/color'

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
      return e === 0 ? Color(0xff0000) : Color(0x0000ff)
    },
    defaultColor: Color(0x777777),
  },
  getLabel(e) {
    return e === 0 ? 'Odd stripe' : 'Even stripe'
  },
})

export default StripedResidues
