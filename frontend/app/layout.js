import "./globals.css";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Conduit — Weather & Agricultural Risk API",
  description:
    "Conduit streams real-time telemetry from IoT weather stations across East Africa. One key, one base URL.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
        <Footer />

        <Analytics />
      </body>
    </html>
  );
}
