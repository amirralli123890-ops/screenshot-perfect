import {createFileRoute} from '@tanstack/react-router';
import {CategoryPage} from '@/components/publication/category-page';
import {feedOptions} from '@/lib/feed-query';
import {pageHead} from '@/lib/publication';
export const Route=createFileRoute('/reviews-comparisons')({validateSearch:(s:Record<string,unknown>):{page?:number}=>({page:Math.max(1,Number(s['page'])||1)}),loaderDeps:({search})=>({page:search.page??1}),loader:({context,deps})=>context.queryClient.ensureQueryData(feedOptions('reviews-comparisons',deps.page)),head:()=>pageHead('Reviews & Comparisons','Thoughtful technology reviews and product comparisons.'),component:Page});
function Page(){const {page=1}=Route.useSearch();return <CategoryPage slug="reviews-comparisons" page={page}/>;}
