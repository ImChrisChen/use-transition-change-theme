type Animation = 'ease-in' | 'ease-out' | 'linear'

export interface ToggleThemeOptions {
  x: number
  y: number
  duration?: number
  styleClass?: string
  animation?: Animation
}

