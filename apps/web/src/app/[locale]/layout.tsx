import {marketingOrigin} from '@/lib/marketing-metadata';
import {publicBrand} from '@/lib/marketing-content';
import type {Metadata} from 'next';
import {hasLocale, NextIntlClientProvider} from 'next-intl';import {setRequestLocale} from 'next-intl/server';import {notFound} from 'next/navigation';import {routing} from '@/i18n/routing';import '@/app/globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export const metadata:Metadata={metadataBase:marketingOrigin,title:publicBrand.name,description:'Fictional real-estate agency workspace prototype.',robots:{index:false,follow:false}};

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
