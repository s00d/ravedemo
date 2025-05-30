import type { App } from 'vue'

declare global {
  interface Window {
    smoothScrollAnimation?: number;
    isAutoScrolling?: boolean;
  }
}

export const smoothScrollPlugin = {
  install: (app: App) => {
    let isUserScrolling = false
    let lastScrollTime = 0
    const scrollThreshold = 50 // порог для определения ручного скролла (в пикселях)
    const scrollTimeout = 150 // время в мс, после которого считаем, что скролл остановился
    let appElement: HTMLElement | null = null

    // Инициализация элемента .app после монтирования приложения
    app.mixin({
      mounted() {
        if (!appElement) {
          appElement = document.querySelector('.app')
        }
      }
    })

    // Функция для остановки автоскролла
    const stopAutoScroll = () => {
      if (window.smoothScrollAnimation) {
        cancelAnimationFrame(window.smoothScrollAnimation)
        window.smoothScrollAnimation = undefined
        window.isAutoScrolling = false
      }
    }

    // Обработчик ручного скролла
    const handleUserScroll = (e: Event) => {
      if (!window.isAutoScrolling || !appElement) return

      const currentTime = performance.now()
      const currentScroll = appElement.scrollTop
      
      // Если прошло достаточно времени с последнего скролла
      if (currentTime - lastScrollTime > scrollTimeout) {
        isUserScrolling = false
      }

      // Если скролл был значительным
      if (Math.abs(currentScroll - lastScrollTime) > scrollThreshold) {
        isUserScrolling = true
        stopAutoScroll()
      }

      lastScrollTime = currentTime
    }

    // Добавляем слушатели на сам элемент .app
    const addScrollListeners = () => {
      if (!appElement) return
      
      appElement.addEventListener('wheel', handleUserScroll, { passive: true })
      appElement.addEventListener('touchmove', handleUserScroll, { passive: true })
      appElement.addEventListener('scroll', handleUserScroll, { passive: true })
    }

    const removeScrollListeners = () => {
      if (!appElement) return
      
      appElement.removeEventListener('wheel', handleUserScroll)
      appElement.removeEventListener('touchmove', handleUserScroll)
      appElement.removeEventListener('scroll', handleUserScroll)
    }

    const smoothScrollToBottom = () => {
      if (!appElement) {
        appElement = document.querySelector('.app')
        if (!appElement) return
        addScrollListeners()
      }

      const duration = 15000 // 15 секунд
      const start = appElement.scrollTop
      const end = appElement.scrollHeight - appElement.clientHeight
      const startTime = performance.now()
      let animationFrame: number

      // Линейная функция с небольшим ускорением в начале и замедлением в конце
      const easeInOutSine = (t: number): number => {
        return -(Math.cos(Math.PI * t) - 1) / 2
      }

      const animateScroll = (currentTime: number) => {
        if (isUserScrolling || !appElement) {
          stopAutoScroll()
          return
        }

        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Используем синусоидальную функцию для более равномерного движения
        const easeProgress = easeInOutSine(progress)
        
        // Вычисляем новую позицию с небольшим ускорением
        const newPosition = Math.round(start + (end - start) * easeProgress)
        
        // Прокручиваем блок .app
        appElement.scrollTop = newPosition

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animateScroll)
        } else {
          window.isAutoScrolling = false
        }
      }

      stopAutoScroll()
      window.isAutoScrolling = true
      window.smoothScrollAnimation = requestAnimationFrame(animateScroll)
    }

    // Добавляем глобальное свойство
    app.config.globalProperties.$smoothScroll = smoothScrollToBottom

    // Добавляем в provide/inject
    app.provide('smoothScroll', smoothScrollToBottom)

    // Очищаем слушатели при уничтожении приложения
    app.unmount = () => {
      removeScrollListeners()
      stopAutoScroll()
    }
  }
} 