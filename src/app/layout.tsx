import "./globals.css";
import Navbar from "../components/Navbar";
import Navbar2Wrapper from "../components/Navbar2Wrapper";
import FooterWrapper from "../components/FooterWrapper";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "VolleyLive – VNL Live Stream & Volleyball Schedule Mongolia",
  description:
    "VolleyLive.mn – VNL live үзэх, волейболын хуваарь, багууд, тоглогчдын статистик. Монголын волейболын live платформ.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <Navbar2Wrapper />
        {children}
        <FooterWrapper />
        <Analytics />
      </body>
    </html>
  );
}
