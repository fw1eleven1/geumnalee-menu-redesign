// 한 가지 외곽선 아이콘 세트 (stroke 1.5). 크기는 --icon-size 로 조절한다.
const PATHS = {
	'arrow-right': <path d='M4 12h15M13 6l6 6-6 6' />,
	'arrow-left': <path d='M20 12H5M11 6l-6 6 6 6' />,
	close: <path d='M6 6l12 12M18 6L6 18' />,
	'chevron-down': <path d='M6 9l6 6 6-6' />,
	check: <path d='M5 12.5l4.5 4.5L19 7.5' />,
	alert: (
		<>
			<circle cx='12' cy='12' r='9' />
			<path d='M12 7.5v5.5M12 16.5v.01' />
		</>
	),
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({ name, className = '' }: { name: IconName; className?: string }) {
	return (
		<svg className={`icon ${className}`} viewBox='0 0 24 24' aria-hidden='true' focusable='false'>
			{PATHS[name]}
		</svg>
	);
}
