interface SectionHeadProps {
	id?: string;
	title: string;
	ko?: string;
	count?: number;
	unit?: string;
}

// 섹션 제목 줄 — 영문 제목 + 한글 부제 + 개수, 아래 먹색 선
export default function SectionHead({ id, title, ko, count, unit = '' }: SectionHeadProps) {
	return (
		<div className='sec-head'>
			<h2 className='sec-title' id={id}>
				{title}
			</h2>
			{ko && <span className='sec-ko'>{ko}</span>}
			{count !== undefined && (
				<span className='sec-count'>
					{count}
					{unit}
				</span>
			)}
		</div>
	);
}
