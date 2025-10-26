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
				<Web3Provider>
					{children}
					<Toaster 
						position="top-center"
						toastOptions={{
							className: 'dark:bg-slate-800 dark:text-white',
							style: {
								background: 'var(--card)',
								color: 'var(--card-foreground)',
							},
							success: {
								duration: 3000,
								iconTheme: {
									primary: '#10b981',
									secondary: '#fff',
								},
							},
							error: {
								duration: 4000,
								iconTheme: {
									primary: '#ef4444',
									secondary: '#fff',
								},
							},
						}}
					/>
				</Web3Provider>
				<Analytics />
			</body>
		</html>
	);
}
