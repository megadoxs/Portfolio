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
    },

    '/dashboard/education': {
      en: '/dashboard/education',
      fr: '/tableau-de-bord/formation'
    },

    '/dashboard/work': {
      en: '/dashboard/work',
      fr: '/tableau-de-bord/experience'
    },

    '/dashboard/projects': {
      en: '/dashboard/projects',
      fr: '/tableau-de-bord/projets'
    },

    '/dashboard/skills': {
      en: '/dashboard/skills',
      fr: '/tableau-de-bord/competences'
    },

    '/dashboard/hobbies': {
      en: '/dashboard/hobbies',
      fr: '/tableau-de-bord/loisirs'
    },

    '/dashboard/testimonials': {
      en: '/dashboard/testimonials',
      fr: '/tableau-de-bord/temoignages'
    },

    '/dashboard/resume': {
      en: '/dashboard/resume',
      fr: '/tableau-de-bord/cv'
    },

    '/dashboard/contact': {
      en: '/dashboard/contact',
      fr: '/tableau-de-bord/contact'
    }
  }
});