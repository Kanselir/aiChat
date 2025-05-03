import type { Metadata } from 'next';
 import { Geist_Mono } from 'next/font/google'; // Corrected font import
 import { Inter } from 'next/font/google'; // Use a standard sans-serif font like Inter
 import './globals.css';
 import { Toaster } from "@/components/ui/toaster"; // Import Toaster

 const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

 const geistMono = Geist_Mono({
   variable: '--font-geist-mono',
   subsets: ['latin'],
 });

 export const metadata: Metadata = {
   title: 'PhysiPal - Your Physics Assistant', // Update title
   description: 'AI-powered physics dictionary, practice problem generator, and homework helper.', // Update description
 };

 export default function RootLayout({
   children,
 }: Readonly<{
   children: React.ReactNode;
 }>) {
   return (
     <html lang="en" className="dark"> {/* Apply dark class to html */}
       <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
         {children}
         <Toaster /> {/* Add Toaster component here */}
       </body>
     </html>
   );
 }
