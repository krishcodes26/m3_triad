import type { Metadata } from 'next';
import '../styles/globals.css';
import { AuthProvider } from './providers';

/**
 * Type pairing measured from the SVG references:
 *  - Display: Saira Condensed — condensed caps for page titles, panel titles,
 *    KPI numerals. Width/cap-height ratio matches the reference title (12.0).
 *  - UI/body: IBM Plex Sans — technical, humanist grotesque for copy, labels,
 *    navigation and controls. Caption width/cap-height matches the reference
 *    body line (~52 at 100px), and the tailed "l" / single-storey "g" match.
 *
 * The latin woff2 files are self-hosted in `public/fonts` and declared in
 * `globals.css`, so builds and runtime do not depend on Google Fonts.
 */

export const metadata: Metadata = {
  title: 'M3 Triad',
  description: 'Your personal operating system for Mind, Money, and Muscle',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
