import { Inter } from "next/font/google";
import "./globals.css";
import CustomSessionProvider from "./session-provider";
import { NavBar, Footer } from "./customComponents";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Synthonpedia",
  description: "A free synthons database",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main>
          <CustomSessionProvider>
            <NavBar />
            <div className="pt-16 md:pt-20 lg:pt-24">
              {children}
            </div>
            <Footer />
          </CustomSessionProvider>
        </main>
      </body>
    </html>
  );
}
