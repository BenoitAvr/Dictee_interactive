import { Kalam, Space_Grotesk, Newsreader, Inter} from "next/font/google";
import "./globals.css";
import SessionWrapper from './components/SessionWrapper';
import Navbar from './ui/navbar';
import Footer from './components/Footer';

const kalam = Kalam({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-kalam",
});

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const newsreader = Newsreader({
  weight: ["500"],
  subsets: ["latin"],
  variable: "--font-newsreader",
});


const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="fr" className="h-full">
      <head>
        <title>Dictée Interactive - Améliorez votre orthographe</title>
      </head>
      <body className={`${inter.className} ${kalam.variable} ${spaceGrotesk.variable} ${newsreader.variable} bg-gray-50 flex flex-col min-h-screen`}>
        <SessionWrapper>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex flex-col book-bg">
              {children}
            </main>
            <Footer />
          </div>
        </SessionWrapper>
      </body>
    </html>
  );
}