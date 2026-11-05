import Image from 'next/image';
import type { ReactNode } from 'react';
import type { Wine } from '@/types';
import { formatRegion, legacyWineAnchor, won } from '@/lib/wine';
import Rating from './Rating';
import Icon from './Icon';

interface WineCardProps {
	wine: Wine;
	/** 가격 자리를 바꿀 때 (할인가 등). 없으면 wine.price */
	price?: ReactNode;
	/** 가격 뒤 단위 (예: '/ Glass 120ml') */
	unit?: string;
	/** 카드 전체를 링크로 만들 때 (이 달의 와인 → 보틀 리스트) */
	href?: string;
	/** (호환용) 예전엔 설명 id 접두어로 썼다 — 지금은 쓰지 않는다 */
	idPrefix?: string;
}

export default function WineCard({ wine: v, price, unit, href }: WineCardProps) {
	const region = formatRegion(v.made);
	const meta = [v.year, region].filter(Boolean) as string[];
	const accolades = v.vivino
		? v.vivino
				.split('\n')
				.map((s) => s.trim())
				.filter(Boolean)
		: [];
	const desc = v.desc?.trim();

	const body = (
		<>
			<div className='wine-body'>
				<h3 className='wine-name'>{v.name.trim()}</h3>
				{v.engName && (
					<span className='wine-eng' lang='en'>
						{v.engName.trim()}
					</span>
				)}
				{meta.length > 0 && (
					<p className='wine-meta'>
						{meta.map((m, i) => (
							<span key={m + i}>
								{i > 0 && (
									<span aria-hidden='true' className='pr-2'>
										|
									</span>
								)}
								{m}
							</span>
						))}
					</p>
				)}
				{v.grape && <p className='wine-grape'>{v.grape}</p>}
				<p className='wine-price'>
					{price ?? <span className='price-now'>{won(v.price)}</span>}
					{unit && <span className='price-unit'>{unit}</span>}
				</p>
				{desc && (
					<div className='wine-desc-wrap'>
						<p className='wine-desc'>{desc}</p>
					</div>
				)}
				{v.opinion && <p className='wine-desc'>{v.opinion}</p>}
				{v.rating && v.rating.length > 0 && <Rating rating={v.rating} maxRating={v.maxRating} />}
				{accolades.length > 0 && (
					<ul className='accolades' lang='en'>
						{accolades.map((a, i) => (
							<li key={i}>{a}</li>
						))}
					</ul>
				)}
				{href && (
					<span className='wine-go'>
						리스트에서 보기
						<Icon name='arrow-right' />
					</span>
				)}
			</div>
			<div className='wine-bottle'>
				{v.img && (
					// 병 이미지는 원본 비율 그대로 (width/height 는 자리 잡기용 대략값, 실제 비율은 height:auto 가 따른다)
					<Image src={v.img} alt={`${v.name.trim()} 병`} width={160} height={600} unoptimized />
				)}
			</div>
		</>
	);

	// 일반 <a> — 전체 페이지 이동이라야 :target 강조와 앵커 스크롤이 정확히 동작한다
	return href ? (
		// eslint-disable-next-line @next/next/no-html-link-for-pages
		<a className='wine' href={href}>
			{body}
		</a>
	) : (
		<article className='wine' id={legacyWineAnchor(v.name)}>
			{body}
		</article>
	);
}
