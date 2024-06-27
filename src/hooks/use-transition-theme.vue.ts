import type { Ref } from 'vue'
import { nextTick, onMounted } from 'vue'
import { ToggleThemeOptions } from "../interfaces";

export function useTransitionThemeVue(isDark: Ref<boolean>, setIsDark: (isDark: boolean) => void, isAutoChangeTheme = true) {
  onMounted(() => {
    if (!isAutoChangeTheme)
      return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (e) => {
      const dark = e.matches
      setIsDark(dark)
    })
  })

  function updateView(options: ToggleThemeOptions) {
    if (!document) {
      console.error('document is not defined')
      return
    }

    const defaultOptions: Omit<ToggleThemeOptions, 'x' | 'y'> = {
      duration: 400,
      styleClass: 'transition-style',
      animation: 'ease-in',
    }

    const opts = { ...defaultOptions, ...options } as Required<ToggleThemeOptions>

    // 在不支持的浏览器里不做动画
    if (!document.startViewTransition) {
      console.warn('document.startViewTransition is not defined')
      setIsDark(!isDark.value)
      return
    }

    const hasStyle = document.querySelector(`.${opts.styleClass}`)
    if (!hasStyle) {
      const style = document.createElement('style')
      style.textContent = `
          /* 默认主题样式 */
          html.dark {
            background-color: #1b1b1b;
          }
          /* Alternative custom animation style */
          ::view-transition-old(root),
          ::view-transition-new(root) {
            height: auto;
            width: 100vw;
            animation: none;
            mix-blend-mode: normal;
          }
          html.dark::view-transition-old(root) {
            z-index: 2147483646;
          }
          html.dark::view-transition-new(root) {
            z-index: 1;
          }
          html::view-transition-old(root) {
            z-index: 1;
          }
          html::view-transition-new(root) {
            z-index: 2147483646;
          }
        }
          `
      style.classList.add(opts.styleClass)
      document.head.appendChild(style)
    }

    // 开始一次视图过渡：
    const transition = document.startViewTransition(() => setIsDark(!isDark.value))
    transition.ready.then(() => {
      const {
        x,
        y,
      } = options

      // 计算按钮到最远点的距离用作裁剪圆形的半径
      const endRadius = Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y),
      )
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]
      console.log(x, y, endRadius, clipPath)
      // 开始动画
      document.documentElement.animate(
        {
          clipPath: isDark.value ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: opts.duration,
          easing: opts.animation,
          pseudoElement: isDark.value
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        },
      )
    })
  }

  return {
    toggleTheme: (event: ToggleThemeOptions) => {
      nextTick().then(() => updateView(event))
    },
  }
}
