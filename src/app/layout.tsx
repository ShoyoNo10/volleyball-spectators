import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Navbar2 from "../components/Navbar2";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <Navbar2/>
        {children}
        <Footer />
      </body>
    </html>
  );
}
