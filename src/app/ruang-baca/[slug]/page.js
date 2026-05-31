import { notFound } from 'next/navigation';
import { getArticleBySlug, getPublishedArticles } from '@/services/articleService';
import ArticleDetailClient from './ArticleDetailClient';

export default async function ArticleDetailPage({ params }) {
  const { slug } = await params;
  
  // Fetch from database (server-side)
  const result = await getArticleBySlug(slug);
  const dbArticle = result?.data;

  if (!dbArticle) {
    notFound();
  }
  
  // Fetch related articles for the client component
  const allResult = await getPublishedArticles({ limit: 10 });
  const relatedArticlesRaw = allResult.success && allResult.data ? allResult.data : [];

  // Map to the format expected by the client component
  const article = {
    id: dbArticle.id,
    title: dbArticle.title,
    slug: dbArticle.slug,
    excerpt: dbArticle.excerpt || '',
    content: dbArticle.content || '',
    category: dbArticle.category || 'Umum',
    image: dbArticle.featuredImageUrl || dbArticle.coverImage || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
    author: dbArticle.authorName || 'Tim Kancah Ate',
    date: dbArticle.publishedAt ? new Date(dbArticle.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
    readTime: `${Math.ceil((dbArticle.content?.length || 0) / 1500)} menit baca`,
    views: dbArticle.viewCount || 0
  };
  
  const relatedArticles = relatedArticlesRaw
    .filter(a => a.id !== dbArticle.id && a.category === dbArticle.category)
    .map(a => ({
      id: a.id,
      title: a.title,
      slug: a.slug,
      excerpt: a.excerpt || '',
      category: a.category || 'Umum',
      image: a.featuredImageUrl || a.coverImage || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
      author: a.authorName || 'Tim Kancah Ate',
      date: a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
      readTime: `${Math.ceil((a.content?.length || 0) / 1500)} menit baca`
    }))
    .slice(0, 3);

  return <ArticleDetailClient article={article} relatedArticles={relatedArticles} />;
}
