'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Tapas } from '@/types';
import { won } from '@/lib/wine';
import SectionHead from './SectionHead';
import Icon from './Icon';

export interface TapasGroup {
	id: string;
	title: string;
	ko: string;
	items: Tapas[];
}

const EXIT_MS = 210;
const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Placeholder() {
	return (
		<span className='dish-ph'>
			<Image src='/images/logo_newmain.png' alt='' width={622} height={622} />
			<span>사진 준비 중</span>
		</span>
	);
}

// MENU 페이지 — 메뉴 목록과, 누르면 아래에서 올라오는 상세 시트
export default function TapasMenu({ groups }: { groups: TapasGroup[] }) {
	const [selected, setSelected] = useState<Tapas | null>(null);
	const [phase, setPhase] = useState<'closed' | 'open' | 'closing'>('closed');
	const triggerRef = useRef<HTMLElement | null>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const closeBtnRef = useRef<HTMLButtonElement>(null);
	const timerRef = useRef<number | undefined>(undefined);
	// 키보드(Enter/Space)로 열었을 때만 포커스를 닫기 버튼 ↔ 메뉴로 옮긴다.
	// 터치로 연 경우 포커스를 옮기면 모바일 Safari 가 테두리(포커스 링)를 남기기 때문.
	const viaKeyboardRef = useRef(false);

	const open = (item: Tapas, trigger: HTMLElement, viaKeyboard: boolean) => {
		window.clearTimeout(timerRef.current);
		triggerRef.current = trigger;
		viaKeyboardRef.current = viaKeyboard;
		setSelected(item);
		setPhase('closed');
		// 한 프레임 뒤에 열어야 올라오는 전환이 보인다
		requestAnimationFrame(() => requestAnimationFrame(() => setPhase('open')));
	};

	const close = useCallback(() => {
		setPhase('closing');
		const finish = () => {
			setSelected(null);
			setPhase('closed');
			if (viaKeyboardRef.current) triggerRef.current?.focus({ preventScroll: true });
		};
		if (prefersReduced()) finish();
		else timerRef.current = window.setTimeout(finish, EXIT_MS);
	}, []);

	// 시트가 떠 있는 동안: 배경 스크롤 잠금, Esc 로 닫기, Tab 포커스 가두기
	useEffect(() => {
		if (!selected) return;
		const html = document.documentElement;
		html.classList.add('is-locked');
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				close();
				return;
			}
			if (e.key !== 'Tab' || !panelRef.current) return;
			const f = [...panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')];
			if (!f.length) return;
			const first = f[0];
			const last = f[f.length - 1];
			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		};
		document.addEventListener('keydown', onKey);
		return () => {
			html.classList.remove('is-locked');
			document.removeEventListener('keydown', onKey);
		};
	}, [selected, close]);

	useEffect(() => {
		if (phase !== 'open') return;
		// 키보드: 닫기 버튼에 포커스(링 표시) / 터치: 시트 자체에 포커스(링 없음) — 스크린리더는 둘 다 시트 안으로 들어온다
		if (viaKeyboardRef.current) closeBtnRef.current?.focus({ preventScroll: true });
		else panelRef.current?.focus({ preventScroll: true });
	}, [phase]);

	useEffect(() => () => window.clearTimeout(timerRef.current), []);

	return (
		<>
			{groups.map((g) => (
				<section key={g.id} className='sec' id={g.id} aria-labelledby={`${g.id}-h`}>
					<SectionHead id={`${g.id}-h`} title={g.title} />
					<ul className='dish-list' role='list'>
						{g.items.map((item) => (
							<li key={item.id}>
								<button
									type='button'
									className='dish'
									aria-haspopup='dialog'
									onClick={(e) => open(item, e.currentTarget, e.detail === 0)}>
									<span className='dish-text'>
										<span className='dish-name'>{item.name}</span>
										{item.desc && <span className='dish-desc'>{item.desc}</span>}
										<span className='dish-price'>{won(item.price)}</span>
									</span>
									<span className='dish-thumb'>
										{item.img ? (
											<Image src={item.img} alt='' width={300} height={300} unoptimized />
										) : (
											<Placeholder />
										)}
									</span>
								</button>
							</li>
						))}
					</ul>
				</section>
			))}

			{selected && (
				<div className={`sheet${phase === 'open' ? ' is-open' : ''}${phase === 'closing' ? ' is-closing' : ''}`}>
					<div className='sheet-scrim' onClick={close} />
					<div
						className='sheet-panel'
						role='dialog'
						aria-modal='true'
						aria-labelledby='sheet-title'
						tabIndex={-1}
						ref={panelRef}>
						<div className='sheet-bar'>
							<span className='eyebrow'>Tapas · 타파스</span>
							<button type='button' className='icon-btn' aria-label='닫기' onClick={close} ref={closeBtnRef}>
								<Icon name='close' />
							</button>
						</div>
						<div className='sheet-body'>
							<div className='sheet-photo'>
								{selected.img ? (
									// 상세에서는 사진을 자르지 않고 원본 비율 그대로
									<Image src={selected.img} alt={selected.name} width={900} height={900} unoptimized />
								) : (
									<Placeholder />
								)}
							</div>
							<div className='sheet-content'>
								<h2 className='sheet-name' id='sheet-title'>
									{selected.name}
								</h2>
								<p className='sheet-price'>{won(selected.price)}</p>
								{selected.desc && <p className='sheet-desc'>{selected.desc}</p>}
								<Link className='btn btn-ghost' href={`/recommend?tapas=${selected.id}&from=tapas`}>
									이 메뉴와 어울리는 와인 찾기
									<Icon name='arrow-right' />
								</Link>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
