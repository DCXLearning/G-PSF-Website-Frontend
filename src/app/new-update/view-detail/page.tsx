import Rout from '@/components/News&Updates/list/Rout'
import type { DetailPageData, TiptapNode } from '@/components/News&Updates/list/Detail_top'
import { API_URL } from '@/config/api'
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

function mapPostToDetail(post: CmsPost): DetailPageData {
  return {
    category: pickI18nText(post.category?.name) || 'News & Updates',
    date: formatDate(post.publishedAt) || formatDate(post.createdAt) || formatDate(post.updatedAt),
    title: pickI18nText(post.title) || 'Untitled',
    heroImage: cleanText(post.images?.[0]?.url),
    tagLabel: pickI18nText(post.category?.name) || 'News & Updates',
    tagHref: '/new-update',
    summary: pickI18nText(post.description),
    contentDoc: pickContentDoc(post.content),
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

async function getDetailData(slug?: string, id?: string): Promise<DetailPageData | null> {
  if (!API_URL) {
    return null
  }

  const cleanSlug = cleanText(slug)
  const cleanId = cleanText(id)

  if (!cleanSlug && !cleanId) {
    return null
  }

  // 1) Try direct endpoint by slug first.
  if (cleanSlug) {
    const bySlugResponse = await fetchCmsResponse(
      `${API_URL}/posts/${encodeURIComponent(cleanSlug)}`
    )

    if (bySlugResponse) {
      const bySlugPost = findPostBySlugOrId(bySlugResponse, cleanSlug, undefined)
      if (bySlugPost) {
        return mapPostToDetail(bySlugPost)
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
        return mapPostToDetail(byIdPost)
      }
    }
  }

  // 3) Last fallback: section endpoint. Try slug then id.
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

    if (!sectionPost) {
      continue
    }

    // If section response is partial, fetch full detail by real id.
    const sectionPostId = sectionPost.id ? String(sectionPost.id) : ''
    if (sectionPostId) {
      const fullResponse = await fetchCmsResponse(
        `${API_URL}/posts/${encodeURIComponent(sectionPostId)}`
      )

      if (fullResponse) {
        const fullPost = findPostBySlugOrId(fullResponse, undefined, sectionPostId)
        if (fullPost) {
          return mapPostToDetail(fullPost)
        }
      }
    }

    return mapPostToDetail(sectionPost)
  }

  return null
}

type PageProps = {
  searchParams?: SearchParams | Promise<SearchParams>
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
