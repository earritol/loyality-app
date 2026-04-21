export type Theme = 'light' | 'dark'

export function getThemeFromCookie(cookieValue: string | undefined): Theme {
  return cookieValue === 'dark' ? 'dark' : 'light'
}
