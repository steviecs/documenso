import type { RenderOptions } from '@documenso/email/render';
import { renderWithI18N } from '@documenso/email/render';

import { getI18nInstance } from '../client-only/providers/i18n-server';
import {
  APP_I18N_OPTIONS,
  type SupportedLanguageCodes,
  isValidLanguageCode,
} from '../constants/i18n';

export const renderEmailWithI18N = async (
  component: React.ReactElement,
  options?: RenderOptions & {
    // eslint-disable-next-line @typescript-eslint/ban-types
    lang?: SupportedLanguageCodes | (string & {});
  },
) => {
  try {
    const { lang: providedLang, ...otherOptions } = options ?? {};

    const lang = isValidLanguageCode(providedLang) ? providedLang : APP_I18N_OPTIONS.sourceLang;

    const i18n = await getI18nInstance(lang);

    i18n.activate(lang);

    const result = await renderWithI18N(component, { i18n, ...otherOptions });

    // React 18's renderToPipeableStream inserts <!--$--> / <!--/$--> Suspense
    // boundary markers. SendGrid's XHTML parser (triggered by the email DOCTYPE)
    // treats a comment before <html> as invalid and silently drops the <body>.
    if (typeof result === 'string') {
      return result.replace(/<!--\$(?:!)?-->/g, '').replace(/<!--\/\$-->/g, '');
    }

    return result;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to render email');
  }
};
