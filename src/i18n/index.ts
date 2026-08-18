import { createI18n } from 'vue-i18n'
import en from './messages/en'
import fr from './messages/fr'
import { basicsMessages } from '@/extensions/basics/i18n'
import { dummyMessages } from '@/extensions/dummy/i18n'
import { overlayMessages } from '@/extensions/overlay/i18n'

const SUPPORTED_LOCALES = ['en', 'fr'] as const

type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

function resolveLocale(): SupportedLocale {
    const browserLocale = navigator.language.toLowerCase()

    if (browserLocale.startsWith('fr')) {
        return 'fr'
    }

    return 'en'
}

export const i18n = createI18n({
    legacy: false,
    globalInjection: true,
    locale: resolveLocale(),
    fallbackLocale: 'en',
    messages: {
        en: {
            ...en,
            ...basicsMessages.en,
            ...dummyMessages.en,
            ...overlayMessages.en,
        },
        fr: {
            ...fr,
            ...basicsMessages.fr,
            ...dummyMessages.fr,
            ...overlayMessages.fr,
        },
    },
})
