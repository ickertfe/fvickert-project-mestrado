import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, type Locale } from './config';

export default getRequestConfig(async () => {
  // For now, we'll use a simple approach without routing
  // In production, this would come from cookies, headers, or URL
  const locale: Locale = defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
