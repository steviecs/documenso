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

    // Strip React 18 renderToPipeableStream Suspense boundary markers.
    let html = result.replace(/<!--\$(?:!)?-->/g, '').replace(/<!--\/\$-->/g, '');

    // react-email places the <Preview> component as a <div> directly between
    // </head> and <body>. SendGrid's HTML processor sees this orphaned <div>,
    // implicitly opens a body to contain it, inserts its tracking pixel there,
    // and then discards the actual <body> tag as a duplicate — delivering a
    // blank email. Fix: move anything between </head> and <body> inside <body>.
    html = html.replace(
      /(<\/head>)([\s\S]*?)(<body(?:\s[^>]*)?>\s*)/i,
      (_, head, between, body) => `${head}${body}${between}`,
    );

    // react-email's <Preview> spacer fills a hidden div with ~100 repetitions of
    // zero-width unicode chars (U+200B–200F, U+FEFF) to pad the preview snippet
    // shown in email clients. Each char QP-encodes to 9 bytes, adding ~6KB of
    // invisible content before the body. SendGrid truncates at its open-tracking
    // processing limit, cutting off the body entirely. Strip them — they are
    // invisible and serve no purpose in delivered HTML.
    html = html.replace(/\u200b|\u200c|\u200d|\u200e|\u200f|\ufeff/g, '');

    return html;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to render email');
  }
};
