'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Icon from './Icon';

// 쿼리스트링의 from 값 (정적 렌더링을 깨지 않도록 useSearchParams 대신 location 을 직접 읽는다)
const noopSubscribe = () => () => {};
const readFrom = () => new URLSearchParams(window.location.search).get('from');

export default function Header() {
	const pathname = usePathname();
	const from = useSyncExternalStore(noopSubscribe, readFrom, () => null);

	// 메뉴 상세 시트에서 AI 소믈리에로 넘어온 경우(?from=tapas) 뒤로 가기는 메뉴로 돌아간다
	const back =
		pathname === '/recommend' && from === 'tapas'
			? { href: '/tapas', label: '메뉴로 돌아가기' }
			: { href: '/', label: '메인으로' };

	// 홈은 엠블럼 로고가 헤더 역할을 하므로 숨긴다
	if (pathname === '/') return null;

	return (
		<header className='app-header'>
			<div className='app-header-inner'>
				<Link className='icon-btn' href={back.href} aria-label={back.label}>
					<Icon name='arrow-left' />
				</Link>
				<Link className='brand-link' href='/' aria-label='금나리 메인'>
					<Image
						src='/images/logo_header.png'
						alt='GEUMNALEE TAPAS BAR'
						width={737}
						height={186}
						style={{ width: '96px', height: 'auto' }}
						priority
					/>
				</Link>
				<span className='icon-btn icon-spacer' aria-hidden='true' />
			</div>
		</header>
	);
}
