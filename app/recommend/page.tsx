import { getTapas } from '@/lib/api';
import RecommendForm from '@/components/RecommendForm';
import type { TapasOption } from '@/components/RecommendForm';

export const revalidate = 86400; // 24시간마다 재검증

export default async function RecommendPage() {
	// 서버에서 타파스 데이터를 빌드 시 가져옴
	const tapasData = await getTapas();
	const tapasOptions: TapasOption[] = tapasData.map((t) => ({
		id: t.id,
		option: t.name,
		value: t.name,
		category: t.category,
	}));

	return (
		<div className='page somm'>
			<div id='somm-top'>
				<div className='title-by'>
					<h1 className='somm-title'>AI 소믈리에 금나리</h1>
					<span className='by-line'>by ChatGPT</span>
				</div>
				<p className='somm-lead'>
					와인 타입과 곁들일 음식을 알려주시면 금나리의 와인 리스트에서 어울리는 와인을 골라 드려요.
				</p>
			</div>

			{/* 클라이언트 컴포넌트 - 폼 및 상호작용 */}
			<RecommendForm initialTapasOptions={tapasOptions} />
		</div>
	);
}
