import Link from 'next/link';

const TABS = [
	{ key: 'menu', label: 'Menu', href: '/tapas', title: 'MENU — 타파스와 사이드' },
	{ key: 'bottle', label: 'Bottle', href: '/wines/conventional', title: 'WINE LIST — 보틀 와인' },
	{ key: 'glass', label: 'Glass', href: '/wines/glass', title: 'WINE by the GLASS — 글라스 와인' },
] as const;

export type TabKey = (typeof TABS)[number]['key'];

interface PageTabsProps {
	active: TabKey;
	/** 탭 아래 한 줄 안내 (예: '보틀 와인 36종') */
	sub?: string;
	/** 화면 제목을 바꿀 때 (기본값은 탭 이름) */
	title?: string;
}

// MENU · BOTTLE · GLASS 페이지 상단 — 홈을 거치지 않고 바로 오가는 탭
export default function PageTabs({ active, sub, title }: PageTabsProps) {
	const current = TABS.find((t) => t.key === active)!;
	return (
		<div className='page masthead'>
			<h1 className='sr-only'>{title ?? current.title}</h1>
			<nav className='tabs' aria-label='메뉴판 이동'>
				{TABS.map((t) => (
					<Link key={t.key} className='tab' href={t.href} aria-current={t.key === active ? 'page' : undefined}>
						{t.label}
					</Link>
				))}
			</nav>
			{sub && <p className='masthead-sub'>{sub}</p>}
		</div>
	);
}
