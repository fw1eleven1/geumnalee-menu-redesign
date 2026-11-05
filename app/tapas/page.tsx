import { getAllTapas } from '@/lib/api';
import PageTabs from '@/components/PageTabs';
import TapasMenu, { type TapasGroup } from '@/components/TapasMenu';

export const revalidate = 86400; // 24시간마다 재검증

export default async function TapasPage() {
	const { main, side } = await getAllTapas();

	// 메인·사이드 구분 없이 전부 Tapas 한 섹션으로 보여준다 (순서: 메인 → 사이드)
	const groups: TapasGroup[] = [{ id: 'sec-tapas', title: 'Tapas', ko: '타파스', items: [...main, ...side] }].filter(
		(g) => g.items.length > 0,
	);

	return (
		<>
			<PageTabs active='menu' />
			<div className='page'>
				<TapasMenu groups={groups} />
			</div>
			<div className='view-end' />
		</>
	);
}
