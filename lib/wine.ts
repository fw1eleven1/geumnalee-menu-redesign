import type { Wine } from '@/types';

/** 와인 종류별 표기 — 섹션 제목(영문), 한글 부제, 바로가기 라벨 */
export const WINE_TYPE_META: Record<Wine['type'], { title: string; ko: string; label: string }> = {
	Champagne: { title: 'Champagne', ko: '샴페인', label: 'CHAMPAGNE' },
	Sparkling: { title: 'Sparkling', ko: '스파클링', label: 'SPARKLING' },
	Red: { title: 'Red', ko: '레드', label: 'RED' },
	White: { title: 'White', ko: '화이트', label: 'WHITE' },
	Orange: { title: 'Orange', ko: '오렌지', label: 'ORANGE' },
};

export const won = (n: number) => n.toLocaleString('ko-KR');

/** 'France > Bourgogne' → 'France · Bourgogne' */
export const formatRegion = (made: string | null) =>
	made
		? made
				.split('>')
				.map((s) => s.trim())
				.filter(Boolean)
				.join(' · ')
		: '';

/** 기존 사이트와 같은 앵커 id (와인 이름 기준) — 예전 링크 호환용 */
export const legacyWineAnchor = (name: string) => name.replace(/\s/g, '%20');

/** 이 달의 와인 등에서 리스트의 특정 와인으로 이동할 때 쓰는 앵커 id */
export const wineAnchor = (id: string) => `w-${id}`;
