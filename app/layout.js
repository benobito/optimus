import "./globals.css";

export const metadata = {
  title: "OPTIMUS PRIME 💎🪙",
  description:
    "ទិញតាមរយៈ OPTIMUS Web ទទួលបានការទុកចិត្ត មានសុវត្តិភាព និងលឿនរហ័សទាន់ចិត្ត មានគ្រប់ប្រភេទដូចជា MLBB FF PUBG HOK …",
  openGraph: {
    title: "OPTIMUS PRIME",
    description:
      "ទិញតាមរយៈ OPTIMUS Web ទទួលបានការទុកចិត្ត មានសុវត្តិភាព និងលឿនរហ័សទាន់ចិត្ត មានគ្រប់ប្រភេទដូចជា MLBB FF PUBG HOK …",
  },
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
