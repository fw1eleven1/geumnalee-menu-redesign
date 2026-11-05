import { getWines } from '@/lib/api';
import PageTabs from '@/components/PageTabs';
import WineSections from '@/components/WineSections';

export const revalidate = 86400; // 24시간마다 재검증

export default async function ConventionalWinesPage() {
	const wines = await getWines('conventional');

	return (
		<>
			<PageTabs active='bottle' />
			<WineSections wines={wines} order={['Champagne', 'Sparkling', 'Red', 'White']} prefix='bottle' />
		</>
	);
}
