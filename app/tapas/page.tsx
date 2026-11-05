import { getAllTapas } from '@/lib/api';
import PageTabs from '@/components/PageTabs';
import SectionRail from '@/components/SectionRail';
import TapasMenu, { type TapasGroup } from '@/components/TapasMenu';

export const revalidate = 86400; // 24시간마다 재검증

export default async function TapasPage() {
	const { main, side } = await getAllTapas();

	const groups: TapasGroup[] = [
		{ id: 'sec-tapas', title: 'Tapas', ko: '타파스', items: main },
		{ id: 'sec-side', title: 'Side', ko: '사이드', items: side },
	].filter((g) => g.items.length > 0);

	return (
		<>
			<PageTabs active='menu' />
			<SectionRail
				label='섹션 바로가기'
				items={groups.map((g) => ({ id: g.id, label: g.title.toUpperCase() }))}
			/>
			<div className='page'>
				<TapasMenu groups={groups} />
			</div>
			<div className='view-end' />
		</>
	);
}
