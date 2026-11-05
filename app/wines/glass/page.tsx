import Link from 'next/link';
import Image from 'next/image';
import { getGlassWines } from '@/lib/api';
import PageTabs from '@/components/PageTabs';
import WineSections from '@/components/WineSections';
import Icon from '@/components/Icon';
import type { Wine } from '@/types';

export const revalidate = 86400; // 24시간마다 재검증

export default async function GlassWinesPage() {
	const items = await getGlassWines();

	// 와인 카드는 그대로 쓰되, 가격 자리에는 잔 가격을 보여준다
	const wines: Wine[] = items.map(({ glassPrice, wine }) => ({ ...wine, price: glassPrice }));

	if (wines.length === 0) {
		return (
			<>
				<PageTabs active='glass' />
				<div className='page'>
					<div className='empty'>
						<Image src='/images/logo_newmain.png' alt='' width={622} height={622} className='empty-mark' />
						<p className='empty-title'>지금은 준비된 글라스 와인이 없어요</p>
						<p className='empty-desc'>보틀 와인 리스트에서 오늘의 와인을 골라 보세요.</p>
						<Link className='btn btn-ghost' href='/wines/conventional'>
							보틀 와인 보기
							<Icon name='arrow-right' />
						</Link>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<PageTabs active='glass' />
			<WineSections
				wines={wines}
				order={['Champagne', 'Sparkling', 'Red', 'White', 'Orange']}
				prefix='glass'
				priceSuffix='/ Glass 120ml'
			/>
		</>
	);
}
