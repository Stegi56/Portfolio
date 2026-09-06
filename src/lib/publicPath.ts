export function publicPath(path: string): string {
  if (/^(?:[a-z]+:|\/|#)/i.test(path)) return path;
  return `/${path}`;
}
