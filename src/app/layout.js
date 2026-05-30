import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

export const metadata = {
  title: "Kancah Ate | Teman Ngobrol, Pengembangan Diri, & Kesehatan Mental Remaja",
  description: "Dukungan kesehatan mental remaja pertama di Indonesia. Ruang curhat anonim, tes psikologi (PHQ-9, GAD-7) yang tervalidasi global, dan artikel edukasi psikologi.",
  keywords: ["kesehatan mental remaja", "curhat online anonim", "tes psikologi remaja", "konseling sebaya", "PHQ-9", "GAD-7", "Kancah Ate"],
  authors: [{ name: "Kancah Ate" }],
  creator: "Kancah Ate",
  publisher: "Kancah Ate",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kancah Ate",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // App-like feel
  themeColor: "#f97316",
};

import { Providers } from "@/components/Providers";
import BottomNav from "@/components/shared/BottomNav";
import { GoogleAnalytics } from '@next/third-parties/google';

import AntiCloneWrapper from "@/components/AntiCloneWrapper";

export default function RootLayout({ children }) {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": ["WebSite", "MedicalWebPage"],
    "name": "Kancah Ate",
    "url": "https://kancahate.my.id",
    "description": "Platform kesehatan mental remaja pertama di Indonesia. Ruang curhat anonim dan tes psikologi yang tervalidasi global.",
    "publisher": {
      "@type": "Organization",
      "name": "Kancah Ate"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Remaja Indonesia"
    },
    "specialty": "Kesehatan Mental Remaja"
  };

  return (
    <html lang="id">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>
      <body className={`${plusJakartaSans.variable} ${plusJakartaSans.className} md:pb-0 pb-24`}>
        <Providers>
          <AntiCloneWrapper>
            {children}
            <BottomNav />
          </AntiCloneWrapper>
        </Providers>
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || "G-3TMHXGZXB8"} />
    </html>
  );
}

