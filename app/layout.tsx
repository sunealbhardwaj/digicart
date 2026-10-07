import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'ApexDigital - Digital Assets & Creator Mega Marketplace',
  description: 'High-converting digital products marketplace for creator bundles, templates, graphic assets, software tools, and marketing resources with instant cloud delivery.',
  openGraph: {
    title: 'ApexDigital - Digital Assets & Creator Mega Marketplace',
    description: 'High-converting digital products marketplace for creator bundles, templates, graphic assets, software tools, and marketing resources with instant cloud delivery.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ApexDigital - Digital Assets & Creator Mega Marketplace',
    description: 'High-converting digital products marketplace for creator bundles, templates, graphic assets, software tools, and marketing resources with instant cloud delivery.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
