import "./globals.css";

export const metadata = {
  title: "Food Admin Panel",
  description: "Admin panel for food business owners",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
