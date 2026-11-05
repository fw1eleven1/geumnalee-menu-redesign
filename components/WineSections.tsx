import type { Wine } from '@/types';
import { WINE_TYPE_META } from '@/lib/wine';
import SectionHead from './SectionHead';
import SectionRail from './SectionRail';
import WineList from './WineList';

interface WineSectionsProps {
	wines: Wine[];
	/** 섹션 순서 */
	order: Wine['type'][];
	/** 섹션 id 접두어 (페이지마다 다르게) */
	prefix: string;
	priceSuffix?: string;
}

// 와인 종류별 섹션 + 상단 바로가기 (보틀 · 글라스 · 내추럴 페이지 공용)
export default function WineSections({ wines, order, prefix, priceSuffix }: WineSectionsProps) {
	const groups = order
		.map((type) => ({ type, id: `${prefix}-${type.toLowerCase()}`, ...WINE_TYPE_META[type], items: wines.filter((w) => w.type === type) }))
		.filter((g) => g.items.length > 0);

	return (
		<>
			<SectionRail label='와인 종류 바로가기' items={groups.map((g) => ({ id: g.id, label: g.label }))} />
			<div className='page'>
				{groups.map((g) => (
					<section key={g.id} className='sec' id={g.id} aria-labelledby={`${g.id}-h`}>
						<SectionHead id={`${g.id}-h`} title={g.title} />
						<WineList wines={g.items} priceSuffix={priceSuffix} />
					</section>
				))}
			</div>
			<div className='view-end' />
		</>
	);
}
