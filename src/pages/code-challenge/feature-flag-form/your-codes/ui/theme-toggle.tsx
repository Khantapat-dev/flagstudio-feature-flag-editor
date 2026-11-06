import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type ThemeMode = 'light' | 'dark'

function getInitialMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const stored = window.localStorage.getItem('theme')

  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  return 'dark'
}

function applyThemeMode(mode: ThemeMode) {
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(mode)

  document.documentElement.setAttribute('data-theme', mode)
  document.documentElement.style.colorScheme = mode
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('dark')

  useEffect(() => {
    const initialMode = getInitialMode()
    setMode(initialMode)
    applyThemeMode(initialMode)
  }, [])

  function toggleMode() {
    const nextMode: ThemeMode = mode === 'light' ? 'dark' : 'light'

    setMode(nextMode)
    applyThemeMode(nextMode)
    window.localStorage.setItem('theme', nextMode)
  }

  const isDark = mode === 'dark'

  return (
    <button type="button" onClick={toggleMode}>
      {isDark ? <Moon className="size-5" /> : <Sun className="size-5" />}
    </button>
  )
}
