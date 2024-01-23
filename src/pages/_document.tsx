import React from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  /**static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }*/

  render() {
    return (
      <Html>
        <Head>
          <link rel='icon' href='/logo_circle.png' />
          <meta name='theme-color' content='#000000' />
          <meta
            name='description'
            content='QuickSwap is a next-gen #DEX for #DeFi. Trade at lightning-fast speeds with near-zero gas fees.'
          />
          <link rel='apple-touch-icon' href='/logo_circle.png' />

          <link rel='manifest' href='/manifest.json' />
          <link rel='preconnect' href='https://fonts.googleapis.com' />
          <link rel='preconnect' href='https://fonts.gstatic.com' />
          <link
            href='https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap'
            rel='stylesheet'
          />
          <link
            href='https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap'
            rel='stylesheet'
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          <SpeedInsights />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
