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

    if (typeof result !== 'string') {
      return result;
    }

    // react-email's <Preview> component appends a hidden inner <div> containing
    // ~100 repetitions of NBSP + zero-width unicode chars as a spacer. When
    // nodemailer QP-encodes these as UTF-8, each multi-byte char expands to =XX
    // sequences, producing ~6KB of dense non-ASCII content before the body.
    // Something in nodemailer's QP encoder stalls on this density and emits an
    // incomplete MIME part, delivering a blank email. Strip the inner spacer div
    // entirely — the preview text in the outer div (data-skip-in-text) is kept.
    // [^<]* matches any non-tag content including NBSP/zero-width chars and any
    // surrounding whitespace React may emit. Only plain <div> (no attributes)
    // is matched, so the outer preview div (which has style="...") is unaffected.
    return result.replace(/<div>[^<]*<\/div>/g, '');
  } catch (err) {
    console.error(err);
    throw new Error('Failed to render email');
  }
};
