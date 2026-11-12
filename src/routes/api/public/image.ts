import {createFileRoute} from '@tanstack/react-router';
import {publicClient} from '@/lib/public-client.server';
export const Route=createFileRoute('/api/public/image')({server:{handlers:{GET:async({request})=>{
 const path=new URL(request.url).searchParams.get('path');if(!path||!/^[-a-zA-Z0-9_/]+\.(jpg|jpeg|png|webp)$/.test(path))return new Response('Not found',{status:404});
 const db=publicClient();const [featured,embedded]=await Promise.all([db.from('articles').select('id').eq('status','published').eq('featured_image',path).limit(1),db.from('articles').select('id').eq('status','published').like('content',`%/api/public/image?path=${encodeURIComponent(path)}%`).limit(1)]);
 if(!featured.data?.length&&!embedded.data?.length)return new Response('Not found',{status:404});
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');const image=await supabaseAdmin.storage.from('article-images').download(path);if(image.error||!image.data)return new Response('Not found',{status:404});return new Response(image.data,{headers:{'Content-Type':image.data.type,'Cache-Control':'public, max-age=300','X-Content-Type-Options':'nosniff'}});
}}}});
