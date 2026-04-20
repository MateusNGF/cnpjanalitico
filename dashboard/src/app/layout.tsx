import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "CNPJ Analítico Dashboard",
    description: "Dashboard analítico para visualização de dados de empresas do Brasil.",
};

import { StoreInitializer } from "@/components/shared/store-initializer";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body
                className={`${inter.variable} antialiased font-sans`}
            >
                <StoreInitializer />
                {children}
            </body>
        </html>
    );
}
