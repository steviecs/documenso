-- Add brandingColor to per-team and per-organisation global settings so the
-- email CTA button can be tinted with the tenant's primary brand color.
ALTER TABLE "OrganisationGlobalSettings" ADD COLUMN "brandingColor" TEXT NOT NULL DEFAULT '';
ALTER TABLE "TeamGlobalSettings" ADD COLUMN "brandingColor" TEXT;
