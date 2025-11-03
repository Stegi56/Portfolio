import { useConfig } from 'vike-react/useConfig'
import { render } from 'vike/abort'
import type { PageContextServer } from 'vike/types'
import type { MDXModule, Blog } from '../../../typeDefs/blog'

const mods = import.meta.glob<MDXModule>(
  '../../../data/blog/*/blog.mdx',
  { eager: true }
) as Record<string, MDXModule>

function data(pageContext: PageContextServer) {
  const cfg = useConfig()
  const { slug } = pageContext.routeParams

  const key = `../../../data/blog/${slug}/blog.mdx` as const
  const mod = mods[key]
  if (!mod) throw render(404)

  const blog: Blog = { ...mod.frontmatter, Content: mod.default }

  const SITE = 'https://stegi56.com'
  const image = blog.cover?.startsWith('http') ? blog.cover : SITE + blog.cover

  cfg({ title: blog.title, image }) // sets <title>, og:title, og:image, twitter:card, …

  const Content = blog.Content
  return { Content }
}

export { data }
export type Data = Awaited<ReturnType<typeof data>>