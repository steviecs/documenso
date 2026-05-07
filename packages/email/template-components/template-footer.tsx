import { Section, Text } from '../components';
import { useBranding } from '../providers/branding';

export type TemplateFooterProps = {
  isDocument?: boolean;
};

// The "sent using Documenso" line and Documenso, Inc. address were
// removed in this fork — Yrney is the brand the recipient sees, not
// Documenso. Brokerages can still set brandingCompanyDetails on their
// team to add their own legal/footer text.
export const TemplateFooter = ({ isDocument: _isDocument = true }: TemplateFooterProps) => {
  const branding = useBranding();

  if (!branding.brandingEnabled || !branding.brandingCompanyDetails) {
    return null;
  }

  return (
    <Section>
      <Text className="my-8 text-sm text-slate-400">
        {branding.brandingCompanyDetails.split('\n').map((line, idx) => {
          return (
            <>
              {idx > 0 && <br />}
              {line}
            </>
          );
        })}
      </Text>
    </Section>
  );
};

export default TemplateFooter;
