export const upperCase = (value: unknown) => String(value).toUpperCase()

export const lowerCase = (value: unknown) => String(value).toLowerCase()

export const capitalCase = (value: unknown) => {
  const str = String(value)
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const titleCase = (value: unknown) => {
  return String(value)
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export const camelCase = (value: unknown) => {
  return String(value)
    .toLowerCase()
    .replace(/(?:^|\s)(\w)/g, (_, c) => c.toUpperCase())
    .replace(/\s+/g, '')
}

export const kebabCase = (value: unknown) => String(value).toLowerCase().replace(/\s+/g, '-')

export const snakeCase = (value: unknown) => String(value).toLowerCase().replace(/\s+/g, '_')

export const pascalCase = (value: unknown) => {
  return String(value)
    .replace(/(?:^|\s)(\w)/g, (_, c) => c.toUpperCase())
    .replace(/\s+/g, '')
}
