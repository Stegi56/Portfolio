import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "600", "800"],
  variable: "--font-inter",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stegi56.com"),
  title: "Joel Staugaitis - Portfolio & Blog",
  description:
    "A generalist who frequently deep dives into new libraries, frameworks, methodologies and languages. Has experience engineering for a platform that serves 45+ million users and providing tech leadership to a new charity.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Portfolio & Blog",
    description: "Software Engineer",
    url: "https://stegi56.com",
    siteName: "Joel Staugaitis - Portfolio & Blog",
    type: "website",
    images: ["/favicon.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0d11",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetBrainsMono.variable}`}>
      <body>
        <div id="root">{children}</div>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-VXFNK1CHFV" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-VXFNK1CHFV');`}
        </Script>
      </body>
    </html>
  );
}
