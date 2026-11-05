import Link from 'next/link';
import Image from 'next/image';
import { getMonthlyWines } from '@/lib/api';
import MonthlyWineList from '@/components/MonthlyWineList';
import SectionHead from '@/components/SectionHead';
import Icon from '@/components/Icon';

export const revalidate = 86400;

const INDEX = [
	{ no: '01', href: '/tapas', title: 'MENU' },
	{ no: '02', href: '/wines/conventional', title: 'WINE LIST' },
	// 대소문자는 쓴 그대로 보여준다 ('by the' 는 소문자)
	{ no: '03', href: '/wines/glass', title: 'WINE by the GLASS' },
];

export default async function HomePage() {
	const monthlyWines = await getMonthlyWines().catch(() => []);

	return (
		<div className='page home'>
			<h1 className='home-brand'>
				<Image
					src='/images/logo_newmain.png'
					alt='금나리 GEUMNALEE TAPAS BAR'
					width={622}
					height={622}
					style={{ width: '96px', height: 'auto' }}
					priority
				/>
			</h1>

			<nav className='index' aria-label='메뉴판'>
				{INDEX.map((row) => (
					<Link key={row.href} className='index-row' href={row.href}>
						<span className='index-no'>{row.no}</span>
						<span className='index-title'>{row.title}</span>
						<Icon name='arrow-right' className='index-arrow' />
					</Link>
				))}
			</nav>

			<Link className='somm-entry' href='/recommend'>
				<span className='stack'>
					<span className='title-by'>
						<span className='somm-entry-title'>AI 소믈리에 금나리</span>
						<span className='by-line'>by ChatGPT</span>
					</span>
					<span className='somm-entry-sub'>취향과 곁들일 음식으로 와인 추천받기</span>
				</span>
				<Icon name='arrow-right' />
			</Link>

			<div className='perk'>
				<Image
					src='/images/logo_naver.jpeg'
					alt=''
					width={300}
					height={300}
					style={{ width: '24px', height: 'auto', flex: 'none' }}
				/>
				<p className='stack'>
					<span className='perk-label'>네이버 영수증 리뷰 작성 시</span>
					<span className='perk-main'>
						<strong>5,000원</strong> 할인
					</span>
				</p>
			</div>

			{monthlyWines.length > 0 && (
				<section className='monthly' aria-labelledby='monthly-h'>
					<SectionHead id='monthly-h' title='Wine of the Month' ko='이 달의 와인' />
					<MonthlyWineList items={monthlyWines} />
				</section>
			)}

			<p className='home-foot'>GEUMNALEE · TAPAS BAR</p>
		</div>
	);
}
