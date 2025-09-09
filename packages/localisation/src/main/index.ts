import Localisation from './Localisation'
import Configuration from './Configuration'
import TranslationLoader from './TranslationLoader'
import LocalisationContext from './LocalisationContext'
import TemplateEngine from './TemplateEngine'

const configuration = new Configuration()
const translationLoader: TranslationLoader = new TranslationLoader(configuration)
const localisationContext: LocalisationContext = new LocalisationContext()
const templateEngine: TemplateEngine = new TemplateEngine(configuration)

export default new Localisation(translationLoader, localisationContext, templateEngine, configuration)

// export types etc
export type { Translations } from './types/TranslationsType'
export type { LocalisationConfiguration } from './types/LocalisationConfiguration'
