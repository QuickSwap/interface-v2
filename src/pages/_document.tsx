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
