import {createFileRoute} from '@tanstack/react-router';
import {CategoryPage} from '@/components/publication/category-page';
import {feedOptions} from '@/lib/feed-query';
import {pageHead} from '@/lib/publication';
export const Route=createFileRoute('/mobile-phones')({validateSearch:(s:Record<string,unknown>):{page?:number}=>({page:Math.max(1,Number(s['page'])||1)}),loaderDeps:({search})=>({page:search.page??1}),loader:({context,deps})=>context.queryClient.ensureQueryData(feedOptions('mobile-phones',deps.page)),head:()=>pageHead('Mobile Phones','Smartphone news, launches and mobile technology.'),component:Page});
function Page(){const {page=1}=Route.useSearch();return <CategoryPage slug="mobile-phones" page={page}/>;}
