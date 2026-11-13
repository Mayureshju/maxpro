import type {Metadata} from 'next';
import {hasLocale, NextIntlClientProvider} from 'next-intl';import {setRequestLocale} from 'next-intl/server';import {notFound} from 'next/navigation';import {routing} from '@/i18n/routing';import '@/app/globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  return {
    title: 'MaxPro — One property record. Every portal.',
    description: locale === 'ar'
      ? 'منصة متكاملة لإدارة العقارات والنشر والعملاء المحتملين في قطر.'
      : 'The connected property workspace for Qatar: listings, approved portal publishing and enquiries.',
    alternates: {canonical: `/${locale}`, languages: {en: '/en', ar: '/ar'}},
    openGraph: {type: 'website', title: 'MaxPro — Property workspace'}
  };
}

export default async function LocaleLayout({children, params}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html data-scroll-behavior="smooth" lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
