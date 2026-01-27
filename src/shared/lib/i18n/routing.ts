import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  pathnames: {
    '/': '/',

    '/dashboard': {
      en: '/dashboard',
      fr: '/tableau-de-bord'
    }
  }
});