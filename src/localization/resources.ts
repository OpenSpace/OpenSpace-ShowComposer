import en from './en.json';

/**
 * In combination with `types/i18next.d.ts` this enables type-safe, autocompleted
 * keys when accessing translations, e.g. `useTranslation('main')`
 */
export const resources = { en } as const;

export type Resources = typeof resources;
