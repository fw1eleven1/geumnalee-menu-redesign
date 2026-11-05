import type { WineRating } from '@/types';

interface RatingProps {
	rating: WineRating[];
	maxRating: number;
}

// 바디·산미·당도 — ●○ 대신 칸 막대 (칸 수 = maxRating)
export default function Rating({ rating, maxRating }: RatingProps) {
	const max = maxRating || 5;
	return (
		<div className='taste'>
			{rating.map((v, i) => (
				<div key={i} className='taste-item'>
					<span className='taste-label'>{v.type}</span>
					<span className='taste-bar' role='img' aria-label={`${v.type} ${max}단계 중 ${v.rating}`}>
						{Array.from({ length: max }, (_, ii) => (
							<i key={ii} className={ii < v.rating ? 'on' : undefined} />
						))}
					</span>
				</div>
			))}
		</div>
	);
}
