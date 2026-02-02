import "./globals.css";
import Navbar from "../components/Navbar";
import Navbar2Wrapper from "../components/Navbar2Wrapper";
import FooterWrapper from "../components/FooterWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <Navbar2Wrapper/>
        {children}
        <FooterWrapper/>
      </body>
    </html>
  );
}
