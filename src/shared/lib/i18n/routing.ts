import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  pathnames: {
    '/': '/',

    '/projects': {
      en: '/projects',
      fr: '/projets'
    },

    '/about': {
      en: '/about',
      fr: '/a-propos'
    },

    '/contact': {
      en: '/contact',
      fr: '/contact'
    },

    '/dashboard': {
      en: '/dashboard',
      fr: '/tableau-de-bord'
    }
  }
});