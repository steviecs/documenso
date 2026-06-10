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
    // We target only plain <div> (no attributes) to avoid matching the outer div.
    // Build char class from code points so the source stays ASCII-clean.
    const spacerCharClass = [0x00a0, 0x200b, 0x200c, 0x200d, 0x200e, 0x200f, 0xfeff]
      .map((cp) => String.fromCodePoint(cp))
      .join('');
    // eslint-disable-next-line no-misleading-character-class
    const spacerDivPattern = new RegExp(`<div>[${spacerCharClass}]+<\\/div>`, 'g');

    return result.replace(spacerDivPattern, '');
  } catch (err) {
    console.error(err);
    throw new Error('Failed to render email');
  }
};
