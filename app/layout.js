import "./globals.css";

export const metadata = {
  title: "OPTIMUS — MLBB & Free Fire Diamonds",
  description: "ទិញ Diamond MLBB និង Free Fire ដោយសុវត្ថិភាព ចែកចាយលឿន",
};

export default function RootLayout({ children }) {
  return (
    <html lang="km">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Inter:wght@400;500;600;700&family=Noto+Sans+Khmer:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-ink text-white font-body antialiased">{children}</body>
    </html>
  );
}
