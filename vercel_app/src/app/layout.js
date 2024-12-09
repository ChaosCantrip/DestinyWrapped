import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import "@/styles/master.css";

export default function RootLayout({ children }){
    return (
        <html>
            <body>
                <Header />
                <main>
                    {children}
                </main>
                <Footer />
            </body>
        </html>
    )
}