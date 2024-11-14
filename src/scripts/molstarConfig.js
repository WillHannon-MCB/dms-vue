/**
 * DefaultPluginUISpec for Mol* plugin: https://github.com/molstar/molstar/blob/master/src/mol-plugin/spec.ts
 * PluginConfig for Mol* plugin: https://github.com/molstar/molstar/blob/master/src/mol-plugin/config.ts
 */

import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec'
import { PluginConfig } from 'molstar/lib/mol-plugin/config'

const molstarConfig = {
  ...DefaultPluginUISpec(),
  config: [[PluginConfig.VolumeStreaming.Enabled, false]],
  layout: {
    initial: {
      isExpanded: false,
      showControls: false,
    },
  },
  components: {
    remoteState: 'none',
  },
}

export default molstarConfig
