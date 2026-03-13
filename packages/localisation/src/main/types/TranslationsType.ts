export interface Translations {
  [locale: string]: {
    [name: string]: Translation
  }
}

export type Translation = {
  [key: string]: string | Translation | (string | Translation)[]
}
