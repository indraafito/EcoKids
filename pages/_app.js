import { SessionProvider } from "next-auth/react";
import { Nunito, Inter } from "next/font/google";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ToastProvider } from "../context/ToastContext";
import ErrorBoundary from "../components/ErrorBoundary";
import LayoutWrapper from "../components/layout/LayoutWrapper";
import SplashScreen from "../components/ui/SplashScreen";
import "../styles/globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  weight: ["300", "400", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  return (
    <SessionProvider session={session}>
      <div className={`${nunito.variable} ${inter.variable} font-sans`}>
        <ErrorBoundary>
          <ToastProvider>
            {loading && <SplashScreen />}
            <LayoutWrapper>
              <Component {...pageProps} />
            </LayoutWrapper>
          </ToastProvider>
        </ErrorBoundary>
      </div>
    </SessionProvider>
  );
}
