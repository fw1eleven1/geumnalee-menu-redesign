import { getWines } from '@/lib/api';
import PageTabs from '@/components/PageTabs';
import WineSections from '@/components/WineSections';

export const revalidate = 86400; // 24시간마다 재검증

// 메뉴판에서는 링크를 숨겨 둔 페이지 — 주소로 들어오면 보틀 탭 아래 내추럴 와인으로 보인다
export default async function NaturalWinesPage() {
	const wines = await getWines('natural');

	return (
		<>
			<PageTabs active='bottle' title='NATURAL — 내추럴 와인' />
			<WineSections wines={wines} order={['Red', 'Orange', 'White']} prefix='natural' />
		</>
	);
}
