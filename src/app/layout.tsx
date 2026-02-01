import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Navbar2Wrapper from "../components/Navbar2Wrapper";

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
        <Footer/>
      </body>
    </html>
  );
}
