import type { Metadata, Viewport } from 'next'
import { Montserrat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import './globals.css'

const montserrat = Montserrat({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat'
});

export const metadata: Metadata = {
  title: 'Privacy | Bia Miranda',
  description: 'Conteudo exclusivo de Bia Miranda - Privacy',
  icons: {
    icon: '/favicon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#ff6b3d',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" data-subdomain="sd">
      <head>
        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '4554368634792285');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=4554368634792285&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body className={`${montserrat.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
