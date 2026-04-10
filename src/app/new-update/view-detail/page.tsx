import type { Metadata } from 'next'
import Rout from '@/components/News&Updates/list-New&Update/Rout'
import type { DetailPageData, TiptapNode } from '@/components/News&Updates/list-New&Update/Detail_top'
import { API_URL } from '@/config/api'
import { buildAbsoluteUrl, buildPathWithQuery } from '@/utils/socialShare'
import { notFound } from 'next/navigation'

type SearchParams = {
  slug?: string
  id?: string
}

type CmsPost = {
  id?: number
  slug?: string
  title?: { en?: string; km?: string }
  description?: { en?: string; km?: string }
  content?: { en?: unknown; km?: unknown }
  coverImage?: string | null
  images?: Array<{ url?: string }>
  publishedAt?: string | null
  createdAt?: string
  updatedAt?: string
  category?: { name?: { en?: string; km?: string } }
}

type CmsResponse = {
  success?: boolean
  message?: string
  data?: {
    blocks?: Array<{
      type?: string
      enabled?: boolean
      posts?: CmsPost[]
    }>
  } | CmsPost
}

const SITE_NAME = 'G-PSF Cambodia'

function cleanText(value?: string | null): string {
  const text = value?.trim() ?? ''
  return text === '.' ? '' : text
}

function normalizeSlug(value?: string): string {
  return cleanText(value).toLowerCase()
}

function pickI18nText(text?: { en?: string; km?: string }): string {
  return cleanText(text?.en) || cleanText(text?.km)
}

function buildDetailPath(post: CmsPost): string {
  if (post.id) {
    return buildPathWithQuery('/new-update/view-detail', {
      id: String(post.id),
      ...(cleanText(post.slug) ? { slug: cleanText(post.slug) } : {}),
    })
  }

  if (cleanText(post.slug)) {
    return buildPathWithQuery('/new-update/view-detail', {
      slug: cleanText(post.slug),
    })
  }

  return '/new-update'
}

function formatDate(dateValue?: string | null): string {
  const raw = cleanText(dateValue)
  if (!raw) return ''

  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) {
    return raw
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function isTiptapDoc(value: unknown): value is TiptapNode {
  if (!value || typeof value !== 'object') {
    return false
  }

  const doc = value as TiptapNode
  return doc.type === 'doc' || Array.isArray(doc.content)
}

function pickContentDoc(content?: { en?: unknown; km?: unknown }): TiptapNode | null {
  if (isTiptapDoc(content?.en)) {
    return content.en
  }

  if (isTiptapDoc(content?.km)) {
    return content.km
  }

  return null
}

function pickPrimaryImage(post: CmsPost): string {
  return cleanText(post.coverImage) || cleanText(post.images?.[0]?.url)
}

function mergePostWithFallback(primaryPost: CmsPost, fallbackPost?: CmsPost): CmsPost {
  if (!fallbackPost) {
    return primaryPost
  }

  return {
    ...fallbackPost,
    ...primaryPost,
    coverImage: cleanText(primaryPost.coverImage) || cleanText(fallbackPost.coverImage),
    images: primaryPost.images?.length ? primaryPost.images : fallbackPost.images,
    description: primaryPost.description ?? fallbackPost.description,
    category: primaryPost.category ?? fallbackPost.category,
    title: primaryPost.title ?? fallbackPost.title,
  }
}

function mapPostToDetail(post: CmsPost): DetailPageData {
  const detailPath = buildDetailPath(post)

  return {
    category: pickI18nText(post.category?.name) || 'News & Updates',
    date: formatDate(post.publishedAt) || formatDate(post.createdAt) || formatDate(post.updatedAt),
    title: pickI18nText(post.title) || 'Untitled',
    heroImage: pickPrimaryImage(post),
    tagLabel: pickI18nText(post.category?.name) || 'News & Updates',
    tagHref: '/new-update',
    summary: pickI18nText(post.description),
    contentDoc: pickContentDoc(post.content),
    shareUrl: buildAbsoluteUrl(detailPath),
  }
}

function isSinglePostData(data: CmsResponse['data']): data is CmsPost {
  if (!data || typeof data !== 'object') {
    return false
  }

  return 'slug' in data || 'title' in data || 'id' in data
}

function findPostBySlugOrId(response: CmsResponse, slug?: string, id?: string) {
  const data = response.data
  const targetSlug = normalizeSlug(slug)

  // Shape A: backend returned single post detail.
  if (isSinglePostData(data)) {
    if (targetSlug) {
      return normalizeSlug(data.slug) === targetSlug ? data : undefined
    }

    if (id) {
      return String(data.id ?? '') === id ? data : undefined
    }

    return data
  }

  // Shape B: { data: { blocks: [...] } }
  const blocks = data?.blocks ?? []
  const postListBlock = blocks.find(
    (block) => block.enabled === true && block.type === 'post_list'
  )
  const posts = postListBlock?.posts ?? []

  if (targetSlug) {
    return posts.find((post) => normalizeSlug(post.slug) === targetSlug)
  }

  if (id) {
    return posts.find((post) => String(post.id) === id)
  }

  return undefined
}

async function fetchCmsResponse(url: string): Promise<CmsResponse | null> {
  const response = await fetch(url, { cache: 'no-store' })

  if (!response.ok) {
    return null
  }

  return (await response.json()) as CmsResponse
}

async function getSectionPost(slug?: string, id?: string): Promise<CmsPost | null> {
  if (!API_URL) {
    return null
  }

  const cleanSlug = cleanText(slug)
  const cleanId = cleanText(id)
  const sectionQueries: Array<{ key: 'slug' | 'id'; value: string }> = []

  if (cleanSlug) {
    sectionQueries.push({ key: 'slug', value: cleanSlug })
  }

  if (cleanId) {
    sectionQueries.push({ key: 'id', value: cleanId })
  }

  for (let index = 0; index < sectionQueries.length; index += 1) {
    const query = sectionQueries[index]
    const sectionUrl = new URL(`${API_URL}/pages/news-and-updates/section`)
    sectionUrl.searchParams.set(query.key, query.value)

    const sectionResponse = await fetchCmsResponse(sectionUrl.toString())
    if (!sectionResponse) {
      continue
    }

    const sectionPost = query.key === 'slug'
      ? findPostBySlugOrId(sectionResponse, query.value, undefined)
      : findPostBySlugOrId(sectionResponse, undefined, query.value)

    if (sectionPost) {
      return sectionPost
    }
  }

  return null
}

async function getDetailData(slug?: string, id?: string): Promise<DetailPageData | null> {
  if (!API_URL) {
    return null
  }

  const cleanSlug = cleanText(slug)
  const cleanId = cleanText(id)

  if (!cleanSlug && !cleanId) {
    return null
  }

  const sectionPost = await getSectionPost(cleanSlug, cleanId)

  // 1) Try direct endpoint by slug first.
  if (cleanSlug) {
    const bySlugResponse = await fetchCmsResponse(
      `${API_URL}/posts/${encodeURIComponent(cleanSlug)}`
    )

    if (bySlugResponse) {
      const bySlugPost = findPostBySlugOrId(bySlugResponse, cleanSlug, undefined)
      if (bySlugPost) {
        return mapPostToDetail(mergePostWithFallback(bySlugPost, sectionPost ?? undefined))
      }
    }
  }

  // 2) Fallback direct endpoint by id.
  if (cleanId) {
    const byIdResponse = await fetchCmsResponse(
      `${API_URL}/posts/${encodeURIComponent(cleanId)}`
    )

    if (byIdResponse) {
      const byIdPost = findPostBySlugOrId(byIdResponse, undefined, cleanId)
      if (byIdPost) {
        return mapPostToDetail(mergePostWithFallback(byIdPost, sectionPost ?? undefined))
      }
    }
  }

  // 3) Last fallback: section post, optionally enriched with full detail.
  if (sectionPost) {
    const sectionPostId = sectionPost.id ? String(sectionPost.id) : ''

    if (sectionPostId) {
      const fullResponse = await fetchCmsResponse(
        `${API_URL}/posts/${encodeURIComponent(sectionPostId)}`
      )

      if (fullResponse) {
        const fullPost = findPostBySlugOrId(fullResponse, undefined, sectionPostId)
        if (fullPost) {
          return mapPostToDetail(mergePostWithFallback(fullPost, sectionPost))
        }
      }
    }

    return mapPostToDetail(sectionPost)
  }

  return null
}

function buildMetadataDescription(detailData: DetailPageData): string {
  return cleanText(detailData.summary) || `${detailData.category} - ${detailData.title}`
}

function buildShareImageUrl(heroImage: string): string {
  const rawImageUrl = cleanText(heroImage)

  if (!rawImageUrl) {
    return buildAbsoluteUrl('/image/gpsf_logo.png')
  }

  return buildAbsoluteUrl(
    buildPathWithQuery('/api/share-image', {
      url: buildAbsoluteUrl(rawImageUrl),
    })
  )
}

type PageProps = {
  searchParams?: SearchParams | Promise<SearchParams>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {})
  const slug = cleanText(resolvedSearchParams.slug) || undefined
  const id = cleanText(resolvedSearchParams.id) || undefined
  const detailData = await getDetailData(slug, id)

  if (!detailData) {
    return {
      title: 'News & Updates',
      description: 'Latest news and updates from G-PSF Cambodia.',
    }
  }

  const description = buildMetadataDescription(detailData)
  const shareImageUrl = buildShareImageUrl(detailData.heroImage)

  return {
    title: detailData.title,
    description,
    alternates: {
      canonical: detailData.shareUrl,
    },
    openGraph: {
      title: detailData.title,
      description,
      url: detailData.shareUrl,
      siteName: SITE_NAME,
      type: 'article',
      images: [
        {
          url: shareImageUrl,
          alt: detailData.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: detailData.title,
      description,
      images: [shareImageUrl],
    },
    other: {
      'og:image': shareImageUrl,
      'og:image:secure_url': shareImageUrl,
      'twitter:image': shareImageUrl,
    },
  }
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {})
  const slug = cleanText(resolvedSearchParams.slug) || undefined
  const id = cleanText(resolvedSearchParams.id) || undefined

  if (!slug && !id) {
    notFound()
  }

  const detailData = await getDetailData(slug, id)

  if (!detailData) {
    notFound()
  }

  return <Rout detailData={detailData} />
}
