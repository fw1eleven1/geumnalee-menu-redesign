'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import Icon from './Icon';

export interface SelectOption {
	value: string;
	label: string;
	disabled?: boolean;
	/** 선택할 수 없는 이유 등 짧은 보조 문구 */
	note?: string;
}

interface SelectSheetProps {
	id: string;
	/** 바깥 <label> 의 id — 버튼 이름을 '라벨 + 현재 값'으로 읽게 한다 */
	labelId: string;
	/** 시트 맨 위 제목 */
	title: string;
	value: string;
	placeholder: string;
	options: SelectOption[];
	onChange: (value: string) => void;
	/** 선택 해제용 첫 줄 (선택 항목일 때만) */
	emptyLabel?: string;
	invalid?: boolean;
	describedBy?: string;
	triggerRef?: RefObject<HTMLButtonElement | null>;
}

const EXIT_MS = 210;
const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 셀렉트 박스 — 누르면 아래에서 선택 목록 시트가 올라온다 (메뉴 상세 시트와 같은 모양)
export default function SelectSheet({
	id,
	labelId,
	title,
	value,
	placeholder,
	options,
	onChange,
	emptyLabel,
	invalid,
	describedBy,
	triggerRef,
}: SelectSheetProps) {
	const [phase, setPhase] = useState<'hidden' | 'enter' | 'open' | 'closing'>('hidden');
	const [active, setActive] = useState(-1);
	const ownTriggerRef = useRef<HTMLButtonElement | null>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const bodyRef = useRef<HTMLDivElement>(null);
	const listRef = useRef<HTMLUListElement>(null);
	const timerRef = useRef<number | undefined>(undefined);
	// 키보드로 열었을 때만 포커스를 목록 ↔ 버튼으로 옮긴다 (터치 시 모바일 포커스 테두리 방지)
	const viaKeyboardRef = useRef(false);
	const focusActiveRef = useRef(false);

	const items: SelectOption[] = emptyLabel ? [{ value: '', label: emptyLabel }, ...options] : options;
	const selected = options.find((o) => o.value === value);
	const mounted = phase !== 'hidden';

	const firstEnabled = items.findIndex((o) => !o.disabled);
	const lastEnabled = items.map((o) => !o.disabled).lastIndexOf(true);
	const step = (from: number, dir: 1 | -1) => {
		for (let i = from + dir; i >= 0 && i < items.length; i += dir) if (!items[i].disabled) return i;
		return from;
	};

	const setTrigger = (el: HTMLButtonElement | null) => {
		ownTriggerRef.current = el;
		if (triggerRef) triggerRef.current = el;
	};

	const openSheet = (viaKeyboard: boolean) => {
		window.clearTimeout(timerRef.current);
		viaKeyboardRef.current = viaKeyboard;
		focusActiveRef.current = viaKeyboard;
		const sel = items.findIndex((o) => o.value === value && !o.disabled);
		setActive(sel >= 0 ? sel : firstEnabled);
		setPhase('enter');
		requestAnimationFrame(() => requestAnimationFrame(() => setPhase('open')));
	};

	const close = useCallback(() => {
		setPhase('closing');
		const finish = () => {
			setPhase('hidden');
			if (viaKeyboardRef.current) ownTriggerRef.current?.focus({ preventScroll: true });
		};
		if (prefersReduced()) finish();
		else timerRef.current = window.setTimeout(finish, EXIT_MS);
	}, []);

	const choose = (v: string) => {
		onChange(v);
		close();
	};

	// 시트가 떠 있는 동안: 배경 스크롤 잠금, Esc 로 닫기, Tab 포커스 가두기
	useEffect(() => {
		if (!mounted) return;
		const html = document.documentElement;
		html.classList.add('is-locked');
		const onKey = (e: globalThis.KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				close();
				return;
			}
			if (e.key !== 'Tab' || !panelRef.current) return;
			const f = [...panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [role="option"][tabindex="0"]')];
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
	}, [mounted, close]);

	// 열릴 때: 현재 선택이 보이도록 목록 위치를 맞추고 포커스를 둔다
	useEffect(() => {
		if (phase !== 'open') return;
		const body = bodyRef.current;
		const current = listRef.current?.querySelector<HTMLElement>('[role="option"][tabindex="0"]');
		if (body && current) {
			body.scrollTop = Math.max(0, current.offsetTop - body.clientHeight / 2 + current.offsetHeight / 2);
		}
		if (!viaKeyboardRef.current) panelRef.current?.focus({ preventScroll: true });
	}, [phase]);

	// 키보드로 움직일 때 해당 항목에 포커스
	useEffect(() => {
		if (phase !== 'open' || !focusActiveRef.current) return;
		listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.focus({ preventScroll: false });
	}, [active, phase]);

	useEffect(() => () => window.clearTimeout(timerRef.current), []);

	const onPanelKey = (e: KeyboardEvent<HTMLDivElement>) => {
		const onOption = (document.activeElement as HTMLElement | null)?.getAttribute('role') === 'option';
		const go = (i: number) => {
			e.preventDefault();
			focusActiveRef.current = true;
			setActive(i);
		};
		switch (e.key) {
			case 'ArrowDown':
				return go(active < 0 ? firstEnabled : step(active, 1));
			case 'ArrowUp':
				return go(active < 0 ? lastEnabled : step(active, -1));
			case 'Home':
				return go(firstEnabled);
			case 'End':
				return go(lastEnabled);
			case 'Enter':
			case ' ':
				if (onOption && items[active] && !items[active].disabled) {
					e.preventDefault();
					viaKeyboardRef.current = true;
					choose(items[active].value);
				}
		}
	};

	return (
		<>
			<button
				type='button'
				id={id}
				ref={setTrigger}
				className={`select-trigger${selected ? '' : ' is-placeholder'}`}
				aria-haspopup='listbox'
				aria-expanded={phase === 'open' || phase === 'enter'}
				aria-labelledby={`${labelId} ${id}`}
				aria-invalid={invalid || undefined}
				aria-describedby={describedBy}
				onClick={(e) => openSheet(e.detail === 0)}>
				<span className='select-value'>{selected?.label ?? placeholder}</span>
				<Icon name='chevron-down' />
			</button>

			{mounted && (
				<div className={`sheet${phase === 'open' ? ' is-open' : ''}${phase === 'closing' ? ' is-closing' : ''}`}>
					<div className='sheet-scrim' onClick={close} />
					<div
						className='sheet-panel'
						role='dialog'
						aria-modal='true'
						aria-labelledby={`${id}-title`}
						tabIndex={-1}
						ref={panelRef}
						onKeyDown={onPanelKey}>
						<div className='sheet-bar'>
							<h2 className='sheet-title' id={`${id}-title`}>
								{title}
							</h2>
							<button type='button' className='icon-btn' aria-label='닫기' onClick={close}>
								<Icon name='close' />
							</button>
						</div>
						<div className='sheet-body' ref={bodyRef}>
							<ul className='option-list' role='listbox' aria-labelledby={`${id}-title`} ref={listRef}>
								{items.map((o, i) => {
									const isSel = o.value === value;
									return (
										<li
											key={o.value || '__empty'}
											role='option'
											data-index={i}
											aria-selected={isSel}
											aria-disabled={o.disabled || undefined}
											tabIndex={i === active ? 0 : -1}
											className={`option-row${isSel ? ' is-selected' : ''}`}
											onClick={() => {
												if (!o.disabled) choose(o.value);
											}}>
											<span className='option-label'>{o.label}</span>
											{o.note && <span className='option-note'>{o.note}</span>}
											{isSel && <Icon name='check' />}
										</li>
									);
								})}
							</ul>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
