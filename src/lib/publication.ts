import type { Database } from '@/integrations/supabase/types';
export type Article = Database['public']['Tables']['articles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Settings = Database['public']['Tables']['site_settings']['Row'];
export const categoryInfo = [
  {slug:'mobile-phones',name:'Mobile Phones',short:'Mobile Phones',icon:'phone',description:'Smartphone launches, mobile innovation, and the devices that keep us connected.'},
  {slug:'gadgets-accessories',name:'Gadgets & Accessories',short:'Gadgets',icon:'headphones',description:'Discover useful gadgets, wearables, and accessories for everyday life.'},
  {slug:'ai-technology',name:'AI & Technology',short:'AI & Tech',icon:'cpu',description:'Explore artificial intelligence and the innovations shaping our digital future.'},
  {slug:'reviews-comparisons',name:'Reviews & Comparisons',short:'Reviews',icon:'star',description:'Thoughtful reviews and practical comparisons to help you choose with confidence.'},
  {slug:'technology-news',name:'Technology News',short:'Tech News',icon:'news',description:'The latest developments from across the world of technology.'},
  {slug:'computers-laptops',name:'Computers & Laptops',short:'Computers',icon:'laptop',description:'Laptops, desktop computers, components, and the future of personal computing.'},
] as const;
export type CategoryPath = '/mobile-phones' | '/gadgets-accessories' | '/ai-technology' | '/reviews-comparisons' | '/technology-news' | '/computers-laptops';
export function categoryPath(slug: string): CategoryPath { return categoryInfo.find(c=>c.slug===slug) ? `/${slug}` as CategoryPath : '/technology-news'; }
export function imageSource(path: string | null) { if (!path) return undefined; return path.startsWith('https://') || path.startsWith('/api/public/image?') ? path : `/api/public/image?path=${encodeURIComponent(path)}`; }
export function slugify(s: string) { return s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
export function canManage(role: string | undefined, section: string) { return role==='super_admin' || (role==='editor' && ['overview','articles','comments'].includes(section)); }
export function pageHead(title: string, description: string) { return {meta:[{title:`${title} | New Digital World`},{name:'description',content:description},{property:'og:title',content:`${title} | New Digital World`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}; }
export const PAGE_SIZE=12;
