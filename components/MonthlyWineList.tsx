import WineCard from './WineCard';
import type { MonthlyWineItem } from '@/types';
import { wineAnchor, won } from '@/lib/wine';

interface MonthlyWineListProps {
	items: MonthlyWineItem[];
}

// 홈의 '이 달의 와인' — 할인가를 보여주고, 누르면 보틀 리스트의 해당 와인으로 이동해 강조된다
export default function MonthlyWineList({ items }: MonthlyWineListProps) {
	return (
		<ul className='wine-list' role='list'>
			{items.map(({ id, discountRate, discountedPrice, wine: v }) => (
				<li key={id}>
					<WineCard
						wine={v}
						idPrefix='monthly'
						href={`/wines/conventional#${wineAnchor(v.id)}`}
						price={
							<>
								<span className='price-now'>{won(discountedPrice)}</span>
								{discountRate > 0 && (
									<>
										<s className='price-was'>
											<span className='sr-only'>정가 </span>
											{won(v.price)}
										</s>
										<span className='price-off'>{discountRate}% 할인</span>
									</>
								)}
							</>
						}
					/>
				</li>
			))}
		</ul>
	);
}
