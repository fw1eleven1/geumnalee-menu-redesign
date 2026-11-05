import type { Metadata, Viewport } from 'next';
import { Marcellus } from 'next/font/google';
import Header from '@/components/Header';
import './globals.css';

// 영문 제목용 서체 (로고 글자와 어울리는 끝이 살짝 퍼지는 형태)
const marcellus = Marcellus({
	weight: '400',
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-marcellus',
});

export const metadata: Metadata = {
	title: 'GEUMNALEE - TAPAS BAR',
	description: 'GEUMNALEE MENU',
	openGraph: {
		title: 'GEUMNALEE - TAPAS BAR',
		description: 'GEUMNALEE MENU',
		images: ['/images/og_logo_main.png'],
	},
};

export const viewport: Viewport = {
	themeColor: '#ffffff',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='ko' className={marcellus.variable}>
			<body className='antialiased'>
				<Header />
				<main>{children}</main>
			</body>
		</html>
	);
}
