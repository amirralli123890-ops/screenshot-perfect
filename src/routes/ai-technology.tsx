import {createFileRoute} from '@tanstack/react-router';
import {CategoryPage} from '@/components/publication/category-page';
import {feedOptions} from '@/lib/feed-query';
import {pageHead} from '@/lib/publication';
export const Route=createFileRoute('/ai-technology')({validateSearch:(s:Record<string,unknown>):{page?:number}=>({page:Math.max(1,Number(s['page'])||1)}),loaderDeps:({search})=>({page:search.page??1}),loader:({context,deps})=>context.queryClient.ensureQueryData(feedOptions('ai-technology',deps.page)),head:()=>pageHead('AI & Technology','Artificial intelligence news and emerging technology.'),component:Page});
function Page(){const {page=1}=Route.useSearch();return <CategoryPage slug="ai-technology" page={page}/>;}
