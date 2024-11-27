/**
 * Mol* Config Service Operations
 *
 * A collection of operations related to the Mol* plugin UI configuration.
 *
 */
import { DefaultPluginUISpec } from 'molstar/lib/mol-plugin-ui/spec'
import { PluginConfig } from 'molstar/lib/mol-plugin/config'

export const MolstarPluginConfig = {
  /**
   * Default configuration for the Mol* plugin
   * @returns {object} - Default configuration
   */
  getDefaultConfig() {
    return {
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
  },

  /**
   * Alternative configurations could be added below
   */
}
