import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="id">
      <Head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
      </Head>
      <body className="antialiased text-primary-dark font-sans">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

