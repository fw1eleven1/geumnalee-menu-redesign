import WineCard from './WineCard';
import type { Wine } from '@/types';
import { wineAnchor } from '@/lib/wine';

interface WineListProps {
	wines: Wine[];
	/** 가격 뒤에 붙는 문구 (예: 글라스 메뉴의 '/ Glass 120ml') */
	priceSuffix?: string;
	/** 앵커 id 접두어 — 같은 와인이 한 페이지에 두 번 나올 때만 바꾼다 */
	idPrefix?: string;
}

export default function WineList({ wines, priceSuffix, idPrefix }: WineListProps) {
	return (
		<ul className='wine-list' role='list'>
			{wines.map((v) => (
				// li 의 id 는 '이 달의 와인' 등에서 #w-<id> 로 바로 이동할 때 쓰인다
				<li key={v.id} id={idPrefix ? undefined : wineAnchor(v.id)}>
					<WineCard wine={v} unit={priceSuffix} idPrefix={idPrefix} />
				</li>
			))}
		</ul>
	);
}
