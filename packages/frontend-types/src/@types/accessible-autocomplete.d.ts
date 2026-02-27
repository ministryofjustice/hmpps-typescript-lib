/**
 * GOV.UK Accessible Autocomplete types based on v3.0.1
 * https://github.com/alphagov/accessible-autocomplete
 *
 * NB: this was recreated manually from javascript sources and may be incomplete!
 */

declare module 'accessible-autocomplete' {
  type Source =
    | string[]
    | {
        (query: string, populateResults: (options: string[]) => void): void
      }

  interface Options {
    element: HTMLElement
    id: string
    source: Source
    inputClasses?: string | null
    hintClasses?: string | null
    menuAttributes?: DOMStringMap
    menuClasses?: string | null
    autoselect?: boolean
    confirmOnBlur?: boolean
    cssNamespace?: string
    defaultValue?: string
    displayMenu?: 'inline' | 'overlay'
    minLength?: number
    name?: string
    onConfirm?: (confirmed: string) => void
    placeholder?: string
    required?: boolean
    showAllValues?: boolean
    showNoOptionsFound?: boolean
    templates?: {
      inputValue: (input: string) => string
      suggestion: (input: string) => string
    }
    dropdownArrow?: (obj: { className: string }) => string
    tNoResults?: () => string
    tStatusQueryTooShort?: (chars: number) => string
    tStatusNoResults?: () => string
    tStatusSelectedOption?: (selectedOption: string, length: number, index: number) => string
    tStatusResults?: (length: number, contentSelectedOption: string) => string
    tAssistiveHint?: () => string
  }

  interface EnhanceSelectOptions extends Omit<Partial<Options>, 'element'> {
    selectElement: HTMLElement
    preserveNullOptions?: boolean
  }

  interface AccessibleAutocomplete {
    (options: Options): void

    enhanceSelectElement(options: EnhanceSelectOptions): void
  }

  const accessibleAutocomplete: AccessibleAutocomplete

  export default accessibleAutocomplete
}
