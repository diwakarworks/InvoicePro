import "@/app/globals.css"; 
import Navbar from "@/components/Navbar/page";

export const metadata = {
  title : "InvoicelyPro",
  description : "Dashboard powered by Auth0 + tailwindCSS" 
}

export default function RootLayout({children}){
  return(
    <html lang="en">
      <body className='bg-gray-200 min-h-screen'>

        <Navbar/>
        <main className='p-6'>{children}</main>
      </body>
    </html>
  );

}