export interface WineRating {
  type: string;
  rating: number;
}

export interface Wine {
  id: string;
  name: string;
  engName: string;
  type: 'Red' | 'White' | 'Orange' | 'Sparkling' | 'Champagne';
  year: string | null;
  alc: string | null;
  made: string | null;
  grape: string | null;
  price: number;
  desc: string | null;
  opinion: string | null;
  img: string | null;
  rating: WineRating[];
  maxRating: number;
  vivino: string | null;
}

export interface Tapas {
  id: string;
  name: string;
  price: number;
  desc: string | null;
  img: string | null;
  category: 'main' | 'side';
}

export interface MonthlyWineItem {
  id: string;
  discountRate: number;
  discountedPrice: number;
  wine: Wine;
}

export interface GlassWineItem {
  id: string;
  glassPrice: number;
  wine: Wine;
}
