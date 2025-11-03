export { onBeforePrerenderStart }

function onBeforePrerenderStart() {
  const mods = import.meta.glob('../../data/blog/*/blog.mdx', { eager: true })
  const urls = Object.keys(mods).map(p => {
    const m = p.match(/\/data\/blog\/([^/]+)\/blog\.mdx$/)!
    return `/blog/${m[1]}`
  })
  return urls
}
