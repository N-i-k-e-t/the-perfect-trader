/** Runtime product config — override via env on Vercel */
export const IS_BETA =
    process.env.NEXT_PUBLIC_BETA_MODE !== 'false' &&
    process.env.NEXT_PUBLIC_BETA_MODE !== '0';

export const APP_VERSION = '1.1.0';

export const SUPPORT_EMAIL =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@theperfecttrader.app';

export const PRIVACY_EMAIL =
    process.env.NEXT_PUBLIC_PRIVACY_EMAIL ?? 'privacy@theperfecttrader.app';

export const LEGAL_ENTITY =
    process.env.NEXT_PUBLIC_LEGAL_ENTITY ?? 'The Perfect Trader';

export const SUPABASE_REGION_LABEL =
    process.env.NEXT_PUBLIC_SUPABASE_REGION_LABEL ?? 'ap-northeast-1 (Tokyo)';
