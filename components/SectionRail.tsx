'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface RailItem {
	/** 이동할 섹션 요소의 id */
	id: string;
	label: string;
	/** 없으면 숫자를 표시하지 않는다 */
	count?: number;
}

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 화면 위에 붙어 있는 헤더 + 바로가기 줄 높이 */
function stickyOffset(rail: HTMLElement | null) {
	const header = document.querySelector<HTMLElement>('.app-header');
	return (header?.offsetHeight ?? 0) + (rail?.offsetHeight ?? 0);
}

// 스크롤해도 따라오는 섹션 바로가기. 누르면 해당 섹션으로 이동하고, 스크롤하면 현재 섹션에 밑줄이 따라간다.
export default function SectionRail({ items, label }: { items: RailItem[]; label: string }) {
	const wrapRef = useRef<HTMLDivElement>(null);
	const railRef = useRef<HTMLDivElement>(null);
	const [active, setActive] = useState(items[0]?.id);

	// 현재 칩이 가로 스크롤 밖에 있으면 보이는 위치로 옮긴다
	const reveal = useCallback((id: string) => {
		const rail = railRef.current;
		const chip = rail?.querySelector<HTMLElement>(`[data-target="${id}"]`);
		if (!rail || !chip) return;
		const pad = 20;
		if (chip.offsetLeft < rail.scrollLeft + pad || chip.offsetLeft + chip.offsetWidth > rail.scrollLeft + rail.clientWidth - pad) {
			rail.scrollTo({ left: chip.offsetLeft - pad, behavior: prefersReduced() ? 'auto' : 'smooth' });
		}
	}, []);

	useEffect(() => {
		let ticking = false;
		const update = () => {
			ticking = false;
			const offset = stickyOffset(wrapRef.current) + 24;
			let current = items[0]?.id;
			for (const it of items) {
				const el = document.getElementById(it.id);
				if (el && el.getBoundingClientRect().top - offset <= 0) current = it.id;
			}
			if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
				current = items[items.length - 1]?.id;
			}
			setActive((prev) => (prev === current ? prev : current));
		};
		const onScroll = () => {
			if (!ticking) {
				ticking = true;
				requestAnimationFrame(update);
			}
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	}, [items]);

	useEffect(() => {
		if (active) reveal(active);
	}, [active, reveal]);

	const jump = (id: string) => {
		const sec = document.getElementById(id);
		if (!sec) return;
		const y = sec.getBoundingClientRect().top + window.scrollY - stickyOffset(wrapRef.current) + 1;
		window.scrollTo({ top: y, behavior: prefersReduced() ? 'auto' : 'smooth' });
		setActive(id);
	};

	if (items.length === 0) return null;

	return (
		<div className='rail-wrap' ref={wrapRef}>
			<div className='rail' ref={railRef} role='navigation' aria-label={label}>
				{items.map((it) => (
					<button
						key={it.id}
						type='button'
						className={`chip${active === it.id ? ' is-active' : ''}`}
						data-target={it.id}
						aria-current={active === it.id ? 'true' : undefined}
						onClick={() => jump(it.id)}>
						<span>{it.label}</span>
						{it.count !== undefined && <span className='chip-n'>{it.count}</span>}
					</button>
				))}
			</div>
		</div>
	);
}
