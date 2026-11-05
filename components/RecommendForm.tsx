'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import parse from 'html-react-parser';
import { getWines } from '@/lib/api';
import type { Wine } from '@/types';
import WineCard from './WineCard';
import SectionHead from './SectionHead';
import Icon from './Icon';

export interface TapasOption {
	id: string;
	option: string;
	value: string;
	category?: 'main' | 'side';
}

interface MySelect {
	category: 'conventional' | 'natural';
	wine: string;
	body: string;
	taste: string;
	tapas?: string;
	tapas2?: string;
}

interface RecommendFormProps {
	initialTapasOptions: TapasOption[];
}

const AI_URL = 'https://asia-northeast3-geumnalee.cloudfunctions.net/recommendAI/api/recommend';

const WINE_TYPES = [
	{ value: 'red', label: '레드' },
	{ value: 'white', label: '화이트' },
	{ value: 'orange', label: '오렌지', only: 'natural' },
	{ value: 'sparkling', label: '스파클링', only: 'conventional' },
] as const;

const BODIES = [
	{ value: '가벼운 바디감', label: '가벼운' },
	{ value: '적당한 바디감', label: '적당한' },
	{ value: '묵직한 바디감', label: '묵직한' },
];

const TASTES = [
	{ value: '', label: '상관없음' },
	{ value: 'acid', label: '산미' },
	{ value: 'tannin', label: '탄닌감' },
	{ value: 'sweet', label: '단맛' },
];

const WINE_API_TYPE: Record<string, string> = { red: 'Red', white: 'White', orange: 'Orange', sparkling: 'Sparkling' };

// 메뉴 상세 시트에서 넘어오면 ?tapas=<id> 로 첫 번째 음식을 미리 고른다
const noopSubscribe = () => () => {};
const readPrefill = () => new URLSearchParams(window.location.search).get('tapas');

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function RecommendForm({ initialTapasOptions }: RecommendFormProps) {
	const [myselect, setMyselect] = useState<MySelect>({
		category: 'conventional',
		wine: 'red',
		body: '묵직한 바디감', // 기존 셀렉트에서 처음 보이던 값
		taste: '',
	});
	const prefill = useSyncExternalStore(noopSubscribe, readPrefill, () => null);
	const [tapasPick, setTapasPick] = useState<string | null>(null);
	const [tapas2Id, setTapas2Id] = useState('');
	const [submitted, setSubmitted] = useState(false);
	const [fieldError, setFieldError] = useState(false);
	const [requestError, setRequestError] = useState('');
	const [aiResult, setAiResult] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [recommendWine, setRecommendWine] = useState<string[]>([]);
	const [wineList, setWineList] = useState<Wine[]>([]);
	const resultRef = useRef<HTMLDivElement>(null);
	const tapasRef = useRef<HTMLSelectElement>(null);

	const tapasId =
		tapasPick ?? (prefill && initialTapasOptions.some((o) => o.id === prefill) ? prefill : '');
	const tapas = initialTapasOptions.find((o) => o.id === tapasId) ?? null;
	const tapas2 = initialTapasOptions.find((o) => o.id === tapas2Id) ?? null;

	const sendToAI = async () => {
		if (isLoading) return;

		setSubmitted(true);
		setRequestError('');

		if (!tapas) {
			setFieldError(true);
			tapasRef.current?.focus();
			return;
		}
		setFieldError(false);

		const selected = {
			...myselect,
			tapas: tapas.value,
			tapas2: tapas2?.value,
		};

		setIsLoading(true);

		try {
			const response = await fetch(AI_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(selected),
			});

			const json = await response.json();

			if (json.result === 'error') {
				setRequestError('추천을 받지 못했어요. 잠시 후 다시 시도해 주세요.');
				return;
			}

			const resultMessage = json.msg.replace(/[*_]{2}([^*_]+)[*_]{2}/g, '<b>$1</b>');

			const regex = /\*\*(.*?)\*\*/g;
			let match;
			const matches: string[] = [];
			while ((match = regex.exec(json.msg)) !== null) {
				matches.push(match[1]);
			}

			// Fetch wines from API
			const wines = await getWines(myselect.category, WINE_API_TYPE[myselect.wine] ?? 'Sparkling');
			setWineList(wines);
			setRecommendWine(matches);
			setAiResult(resultMessage);
		} catch (err) {
			console.error(err);
			setRequestError('추천을 받지 못했어요. 네트워크 상태를 확인한 뒤 다시 시도해 주세요.');
		} finally {
			setIsLoading(false);
		}
	};

	const updateSelect = (key: keyof MySelect, value: string) => {
		setMyselect((prev) => {
			const updated = { ...prev, [key]: value } as MySelect;

			if (key === 'category') {
				if (prev.wine === 'orange' && value === 'conventional') updated.wine = 'red';
				if (prev.wine === 'sparkling' && value === 'natural') updated.wine = 'red';
			}

			return updated;
		});
	};

	const handleTapas = (id: string) => {
		setTapasPick(id);
		if (id && id === tapas2Id) setTapas2Id('');
		if (id) setFieldError(false);
	};

	useEffect(() => {
		if (isLoading || aiResult) {
			resultRef.current?.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth', block: 'start' });
		}
	}, [isLoading, aiResult]);

	const resetRecommend = () => {
		setAiResult('');
		setWineList([]);
		setRecommendWine([]);
		document.getElementById('somm-top')?.scrollIntoView({ behavior: prefersReduced() ? 'auto' : 'smooth' });
	};

	// AI 답변에서 굵게 표시된 영문 이름과 리스트를 맞춰 추천 와인 카드를 만든다
	const recommended = recommendWine
		.map((v) => wineList.find((x) => x.engName === v.replace(/"/gi, '')))
		.filter((x, i, arr): x is Wine => x !== undefined && arr.findIndex((y) => y?.id === x.id) === i);

	const tapasOptions = (exclude: string) => {
		const groups = [
			{ label: '타파스', items: initialTapasOptions.filter((o) => o.category !== 'side') },
			{ label: '사이드', items: initialTapasOptions.filter((o) => o.category === 'side') },
		].filter((g) => g.items.length > 0);
		return groups.map((g) => (
			<optgroup key={g.label} label={g.label}>
				{g.items.map((v) => (
					<option key={v.id} value={v.id} disabled={v.id === exclude}>
						{v.option}
					</option>
				))}
			</optgroup>
		));
	};

	return (
		<>
			<form
				className='form'
				noValidate
				onSubmit={(e) => {
					e.preventDefault();
					sendToAI();
				}}>
				<fieldset>
					<legend>와인 타입</legend>
					<div className='seg'>
						{WINE_TYPES.filter((t) => !('only' in t) || t.only === myselect.category).map((t) => (
							<label key={t.value} className='choice'>
								<input
									type='radio'
									name='wine'
									value={t.value}
									checked={myselect.wine === t.value}
									onChange={() => updateSelect('wine', t.value)}
								/>
								<span>{t.label}</span>
							</label>
						))}
					</div>
				</fieldset>

				<div className={`field${fieldError ? ' is-error' : ''}`}>
					<label className='label' htmlFor='tapas1'>
						곁들일 음식<span className='req'>필수</span>
					</label>
					<div className='select'>
						<select
							id='tapas1'
							ref={tapasRef}
							value={tapasId}
							aria-required='true'
							aria-invalid={fieldError}
							aria-describedby={fieldError ? 'tapas1-err' : undefined}
							onChange={(e) => handleTapas(e.target.value)}
							onBlur={() => submitted && setFieldError(!tapasId)}>
							<option value=''>음식을 선택해 주세요</option>
							{tapasOptions(tapas2Id)}
						</select>
						<Icon name='chevron-down' />
					</div>
					{fieldError && (
						<p className='field-error' id='tapas1-err'>
							<Icon name='alert' />
							<span>곁들일 음식을 한 가지 골라 주세요. 음식에 맞춰 와인을 추천해 드려요.</span>
						</p>
					)}
				</div>

				<div className='field'>
					<label className='label' htmlFor='tapas2'>
						추가 음식<span className='opt'>선택</span>
					</label>
					<div className='select'>
						<select id='tapas2' value={tapas2Id} onChange={(e) => setTapas2Id(e.target.value)}>
							<option value=''>음식을 선택해 주세요</option>
							{tapasOptions(tapasId)}
						</select>
						<Icon name='chevron-down' />
					</div>
				</div>

				<fieldset>
					<legend>바디감</legend>
					<div className='seg'>
						{BODIES.map((b) => (
							<label key={b.value} className='choice'>
								<input
									type='radio'
									name='body'
									value={b.value}
									checked={myselect.body === b.value}
									onChange={() => updateSelect('body', b.value)}
								/>
								<span>{b.label}</span>
							</label>
						))}
					</div>
				</fieldset>

				<fieldset>
					<legend>
						더 원하는 맛<span className='opt'>선택</span>
					</legend>
					<div className='picks'>
						{TASTES.map((t) => (
							<label key={t.value || 'none'} className='choice'>
								<input
									type='radio'
									name='taste'
									value={t.value}
									checked={myselect.taste === t.value}
									onChange={() => updateSelect('taste', t.value)}
								/>
								<span>{t.label}</span>
							</label>
						))}
					</div>
				</fieldset>

				{requestError && (
					<p className='field-error' role='alert'>
						<Icon name='alert' />
						<span>{requestError}</span>
					</p>
				)}

				{aiResult === '' && (
					<button className='btn btn-primary' type='submit' aria-busy={isLoading}>
						{isLoading ? '추천하는 중…' : '와인 추천받기'}
					</button>
				)}
			</form>

			<div ref={resultRef} aria-live='polite'>
				{isLoading && (
					<div className='loading'>
						<p className='loading-msg'>AI 소믈리에 금나리가 답변을 작성하고 있어요…</p>
						<div className='loading-track' aria-hidden='true'>
							<i />
						</div>
						{[0, 1].map((i) => (
							<div key={i} className='skel' aria-hidden='true'>
								<div className='skel-lines'>
									<b />
									<b />
									<b />
									<b />
								</div>
								<span className='skel-bottle' />
							</div>
						))}
					</div>
				)}

				{!isLoading && aiResult && (
					<section className='result' aria-labelledby='result-h'>
						<SectionHead id='result-h' title='For You' ko='금나리의 추천' />
						<div className='answer'>{parse(aiResult)}</div>

						{recommended.length > 0 && (
							<ul className='wine-list' role='list'>
								{recommended.map((x) => (
									<li key={x.id}>
										<WineCard wine={x} idPrefix='rec' />
									</li>
								))}
							</ul>
						)}

						<button type='button' className='btn btn-ghost' onClick={resetRecommend}>
							다시 추천받기
						</button>
					</section>
				)}
			</div>
		</>
	);
}
