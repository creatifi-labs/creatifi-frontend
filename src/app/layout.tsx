import type React from "react";
import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Web3Provider } from "@/providers/Web3Provider";
import { Toaster } from "react-hot-toast"
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
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `
							(function() {
								try {
									const theme = localStorage.getItem('theme');
									const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
									
									if (theme === 'dark' || (!theme && prefersDark)) {
										document.documentElement.classList.add('dark');
									} else {
										document.documentElement.classList.remove('dark');
									}
								} catch (e) {
									console.error('Theme initialization error:', e);
								}
							})();
						`,
					}}
				/>
			</head>
			<body className={`${geist.className} font-sans antialiased`}>
				<Web3Provider>{children}</Web3Provider>

				{/* 🔔 Toast notification global */}
				<Toaster
					position="top-right"
					toastOptions={{
						style: {
							background: "#1E293B", // dark slate
							color: "#fff",
							borderRadius: "10px",
							padding: "10px 16px",
							fontSize: "14px",
						},
						success: {
							iconTheme: {
								primary: "#10B981", // green
								secondary: "#fff",
							},
						},
						error: {
							iconTheme: {
								primary: "#EF4444", // red
								secondary: "#fff",
							},
						},
					}}
				/>

				<Analytics />
			</body>
		</html>
	);
}
