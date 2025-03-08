import * as React from "react"
import { useSettings } from "./settings"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useSettings()

  React.useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
      return () => {
        root.classList.remove(systemTheme)
      }
    } else {
      root.classList.add(theme)
      return () => {
        root.classList.remove(theme)
      }
    }
  }, [theme])

  return <>{children}</>
}