/**
 * An *example* of how the GDS Accessible Autocomplete component can be used as a GOV.UK frontend component in projects.
 */

import accessibleAutocomplete from 'accessible-autocomplete'
import * as govukFrontend from 'govuk-frontend'

interface AccessibleAutocompleteConfig {
  autoselect: boolean
  defaultValue: string
  preserveNullOptions: boolean
  showAllValues: boolean
}

class AccessibleAutocompleteEnhancedSelect extends govukFrontend.ConfigurableComponent<
  HTMLSelectElement,
  AccessibleAutocompleteConfig
> {
  static moduleName = 'autocomplete-enhanced-select'

  static elementType = HTMLSelectElement

  static schema = {
    properties: {
      autoselect: { type: 'boolean' },
      defaultValue: { type: 'string' },
      preserveNullOptions: { type: 'boolean' },
      showAllValues: { type: 'boolean' },
    } as const,
  }

  static defaults = {
    autoselect: true,
    defaultValue: '',
    preserveNullOptions: true,
    showAllValues: true,
  }

  constructor($root: HTMLSelectElement, config: AccessibleAutocompleteConfig) {
    super($root, config)

    accessibleAutocomplete.enhanceSelectElement({
      selectElement: $root,
      autoselect: config.autoselect,
      defaultValue: config.defaultValue,
      preserveNullOptions: config.preserveNullOptions,
      showAllValues: config.showAllValues,
    })
  }
}

govukFrontend.createAll(AccessibleAutocompleteEnhancedSelect)
