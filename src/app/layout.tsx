import type React from "react";
import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Web3Provider } from "@/providers/Web3Provider";
import "./globals.css";

const geist = Inter({ subsets: ["latin"] });
const geistMono = Roboto_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "CreatiFi - Decentralized Creative Funding",
	description:
		"Empowering creators, connecting supporters, powered by Web3 transparency",
	icons: {
		icon: "/favicon.ico",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geist.className} font-sans antialiased`}>
				<Web3Provider>{children}</Web3Provider>
				<Analytics />
			</body>
		</html>
	);
}
