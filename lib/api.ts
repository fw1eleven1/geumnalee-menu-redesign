import type { Wine, Tapas, MonthlyWineItem, GlassWineItem } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';

export async function getWines(category: 'conventional' | 'natural', type?: string): Promise<Wine[]> {
	const params = new URLSearchParams({ category, active: 'true' });
	if (type) params.append('type', type);

	const res = await fetch(`${API_BASE}/api/public/wines?${params}`, {
		next: { revalidate: 86400 }, // 24시간마다 재검증
	});

	if (!res.ok) {
		throw new Error('Failed to fetch wines');
	}

	return res.json();
}

export async function getTapas(category?: 'main' | 'side'): Promise<Tapas[]> {
	const params = new URLSearchParams({ active: 'true' });
	if (category) params.append('category', category);

	const res = await fetch(`${API_BASE}/api/public/tapas?${params}`, {
		next: { revalidate: 86400 },
	});

	if (!res.ok) {
		throw new Error('Failed to fetch tapas');
	}

	return res.json();
}

export async function getAllTapas(): Promise<{ main: Tapas[]; side: Tapas[] }> {
	const [main, side] = await Promise.all([getTapas('main'), getTapas('side')]);

	return { main, side };
}

export async function getAllConventionalWines(): Promise<{
	red: Wine[];
	white: Wine[];
	sparkling: Wine[];
	champagne: Wine[];
}> {
	const wines = await getWines('conventional');

	return {
		red: wines.filter((w) => w.type === 'Red'),
		white: wines.filter((w) => w.type === 'White'),
		sparkling: wines.filter((w) => w.type === 'Sparkling'),
		champagne: wines.filter((w) => w.type === 'Champagne'),
	};
}

export async function getMonthlyWines(): Promise<MonthlyWineItem[]> {
  const res = await fetch(`${API_BASE}/api/public/monthly-wines`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch monthly wines');
  }

  return res.json();
}

export async function getGlassWines(): Promise<GlassWineItem[]> {
	const res = await fetch(`${API_BASE}/api/public/glass-wines`, {
		next: { revalidate: 86400 },
	});

	if (!res.ok) {
		throw new Error('Failed to fetch glass wines');
	}

	return res.json();
}

export async function getAllNaturalWines(): Promise<{
	red: Wine[];
	white: Wine[];
	orange: Wine[];
}> {
	const wines = await getWines('natural');

	return {
		red: wines.filter((w) => w.type === 'Red'),
		white: wines.filter((w) => w.type === 'White'),
		orange: wines.filter((w) => w.type === 'Orange'),
	};
}
