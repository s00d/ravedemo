<template>
  <section class="cyberpunk-portal" ref="sectionRef">
    <InteractiveEffects :colors="['#ff00ff', '#00ffff', '#ff0000', '#00ff00']" :maxRipples="6" :maxTrails="30" :maxWaves="5" />
    <canvas ref="portalCanvas" class="portal-canvas"></canvas>
    
    <div class="portal-content" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 1000 } }">
      <div class="portal-title">
        <h2 class="neon-text" data-text="КИБЕРПАНК">КИБЕРПАНК</h2>
        <div class="portal-subtitle">ПРОРЫВ В БУДУЩЕЕ</div>
      </div>

      <div class="cyber-grid">
        <div class="cyber-column left-column">
          <div v-for="(item, index) in leftItems" :key="'left-' + index"
            class="cyber-item"
            :style="{ '--delay': `${index * 0.2}s` }"
            @mouseenter="onItemHover($event, 'left', index)"
            @mouseleave="onItemLeave($event, 'left', index)"
            @click.stop="handleItemClick($event, 'left', index)"
          >
            <div class="item-content">
              <div class="item-icon">{{ item.icon }}</div>
              <div class="item-title">{{ item.title }}</div>
            </div>
            <div class="item-connection"></div>
          </div>
        </div>

        <div class="portal-center">
          <div class="center-glow"></div>
          <div class="center-icon">⚡</div>
        </div>

        <div class="cyber-column right-column">
          <div v-for="(item, index) in rightItems" :key="'right-' + index"
            class="cyber-item"
            :style="{ '--delay': `${index * 0.2}s` }"
            @mouseenter="onItemHover($event, 'right', index)"
            @mouseleave="onItemLeave($event, 'right', index)"
            @click.stop="handleItemClick($event, 'right', index)"
          >
            <div class="item-content">
              <div class="item-icon">{{ item.icon }}</div>
              <div class="item-title">{{ item.title }}</div>
            </div>
            <div class="item-connection"></div>
          </div>
        </div>
      </div>

      <div class="portal-particles">
        <div v-for="n in 100" :key="n" class="particle"
          :style="{
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`,
            '--size': `${Math.random() * 3 + 1}px`,
            '--duration': `${Math.random() * 4 + 2}s`,
            '--delay': `${Math.random() * 3}s`
          }"
        ></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import InteractiveEffects from './InteractiveEffects.vue'

const sectionRef = ref<HTMLElement | null>(null)
const portalCanvas = ref<HTMLCanvasElement | null>(null)
let animationFrame: number
let ctx: CanvasRenderingContext2D | null = null
let time = 0

const leftItems = [
  {
    icon: '🤖',
    title: 'НЕЙРОНЕТ',
    description: 'Сеть будущего'
  },
  {
    icon: '💾',
    title: 'ДАННЫЕ',
    description: 'Цифровая реальность'
  },
  {
    icon: '🔮',
    title: 'ВИРТУАЛ',
    description: 'Новая реальность'
  }
]

const rightItems = [
  {
    icon: '⚡',
    title: 'ЭНЕРГИЯ',
    description: 'Сила технологий'
  },
  {
    icon: '🌐',
    title: 'СЕТЬ',
    description: 'Глобальное подключение'
  },
  {
    icon: '🔋',
    title: 'МОЩЬ',
    description: 'Неограниченная сила'
  }
]

const initPortal = () => {
  if (!portalCanvas.value) return
  
  const canvas = portalCanvas.value
  ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const draw = () => {
    if (!ctx || !canvas) return

    time += 0.01
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Рисуем искаженный портал
    for (let i = 0; i < 100; i++) {
      const x = canvas.width / 2 + Math.cos(time + i * 0.1) * (100 + i * 2)
      const y = canvas.height / 2 + Math.sin(time + i * 0.1) * (100 + i * 2)
      const size = Math.sin(time * 2 + i * 0.1) * 10 + 20

      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.strokeStyle = `hsla(${i * 3.6}, 100%, 50%, ${Math.sin(time + i * 0.1) * 0.5 + 0.5})`
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Добавляем эффект искажения
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(time * 0.1)
    ctx.scale(1 + Math.sin(time) * 0.1, 1 + Math.cos(time) * 0.1)
    ctx.translate(-canvas.width / 2, -canvas.height / 2)
    ctx.restore()

    animationFrame = requestAnimationFrame(draw)
  }

  draw()
}

const onItemHover = (event: MouseEvent, side: 'left' | 'right', index: number) => {
  const item = event.currentTarget as HTMLElement
  if (!item) return

  gsap.to(item, {
    scale: 1.05,
    x: side === 'left' ? 20 : -20,
    duration: 0.4,
    ease: 'power2.out'
  })

  const icon = item.querySelector('.item-icon')
  if (icon) {
    gsap.to(icon, {
      scale: 1.2,
      rotation: 360,
      duration: 0.6,
      ease: 'back.out(1.7)'
    })
  }

  const connection = item.querySelector('.item-connection')
  if (connection) {
    gsap.to(connection, {
      strokeDashoffset: 0,
      duration: 0.4,
      ease: 'power2.out'
    })
  }
}

const onItemLeave = (event: MouseEvent, side: 'left' | 'right', index: number) => {
  const item = event.currentTarget as HTMLElement
  if (!item) return

  gsap.to(item, {
    scale: 1,
    x: 0,
    duration: 0.4,
    ease: 'power2.out'
  })

  const icon = item.querySelector('.item-icon')
  if (icon) {
    gsap.to(icon, {
      scale: 1,
      rotation: 0,
      duration: 0.4,
      ease: 'power2.out'
    })
  }

  const connection = item.querySelector('.item-connection')
  if (connection) {
    gsap.to(connection, {
      strokeDashoffset: 1000,
      duration: 0.4,
      ease: 'power2.in'
    })
  }
}

const handleItemClick = (event: MouseEvent, side: 'left' | 'right', index: number) => {
  const target = event.currentTarget as HTMLElement
  if (!target) return
  
  const x = event.clientX
  const y = event.clientY
  const colors = ['#ff00ff', '#00ffff', '#ff0000', '#00ff00']
  const color = colors[index % colors.length]
  
  createCyberEffect(x, y, color)
  
  const item = target
  const icon = item.querySelector('.item-icon') as HTMLElement
  const title = item.querySelector('.item-title') as HTMLElement
  const description = item.querySelector('.item-description') as HTMLElement
  
  // Создаем волну
  const wave = document.createElement('div')
  wave.style.cssText = `
    position: absolute;
    inset: 0;
    border: 2px solid ${color};
    opacity: 0;
    transform: scale(0.8);
    pointer-events: none;
  `
  item.appendChild(wave)
  
  // Анимация волны
  gsap.timeline()
    .to(wave, {
      scale: 1.2,
      opacity: 0.8,
      duration: 0.4,
      ease: 'power2.out'
    })
    .to(wave, {
      scale: 1.5,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in',
      onComplete: () => wave.remove()
    })
  
  // Анимация иконки
  gsap.timeline()
    .to(icon, {
      scale: 1.4,
      rotation: 360,
      duration: 0.6,
      ease: 'back.out(1.7)'
    })
    .to(icon, {
      scale: 1,
      rotation: 0,
      duration: 0.4,
      ease: 'power2.inOut'
    })
  
  // Анимация заголовка
  gsap.timeline()
    .to(title, {
      y: -5,
      textShadow: `0 0 20px ${color}`,
      duration: 0.3,
      ease: 'power2.out'
    })
    .to(title, {
      y: 0,
      textShadow: 'none',
      duration: 0.4,
      ease: 'power2.inOut'
    })
  
  // Анимация описания
  gsap.to(description, {
    opacity: 0.5,
    duration: 0.3,
    yoyo: true,
    repeat: 1,
    ease: 'power2.inOut'
  })
}

const createCyberEffect = (x: number, y: number, color: string = '#ff00ff') => {
  const effect = document.createElement('div')
  effect.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: 0;
    height: 0;
    background: ${color};
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 9999;
  `
  document.body.appendChild(effect)

  // Создаем внутренний круг с градиентом
  const innerCircle = document.createElement('div')
  innerCircle.style.cssText = `
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, ${color} 0%, transparent 70%);
    border-radius: 50%;
    opacity: 0.8;
    filter: blur(8px);
  `
  effect.appendChild(innerCircle)

  // Создаем внешнее кольцо
  const outerRing = document.createElement('div')
  outerRing.style.cssText = `
    position: absolute;
    inset: -10px;
    border: 2px solid ${color};
    border-radius: 50%;
    opacity: 0.6;
    transform: scale(0.8);
  `
  effect.appendChild(outerRing)

  // Создаем лучи
  for (let i = 0; i < 8; i++) {
    const ray = document.createElement('div')
    const angle = (i / 8) * Math.PI * 2
    ray.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      width: 2px;
      height: 50px;
      background: ${color};
      transform-origin: 0 0;
      transform: rotate(${angle}rad) translateX(-50%);
      opacity: 0.6;
    `
    effect.appendChild(ray)

    gsap.to(ray, {
      height: 100,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      delay: 0.1
    })
  }

  // Анимация основного элемента
  gsap.timeline()
    .to(effect, {
      width: '150px',
      height: '150px',
      duration: 0.5,
      ease: 'power2.out'
    })
    .to(effect, {
      width: '200px',
      height: '200px',
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in'
    }, '+=0.1')

  // Анимация внутреннего круга
  gsap.to(innerCircle, {
    opacity: 0,
    scale: 1.5,
    duration: 0.8,
    ease: 'power2.out'
  })

  // Анимация внешнего кольца
  gsap.timeline()
    .to(outerRing, {
      scale: 1.2,
      opacity: 0.8,
      duration: 0.3,
      ease: 'power2.out'
    })
    .to(outerRing, {
      scale: 1.5,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in'
    })

  setTimeout(() => {
    if (effect.parentNode) {
      effect.parentNode.removeChild(effect)
    }
  }, 1000)
}

onMounted(() => {
  initPortal()

  window.addEventListener('resize', () => {
    if (portalCanvas.value) {
      portalCanvas.value.width = window.innerWidth
      portalCanvas.value.height = window.innerHeight
    }
  })

  // Анимация появления элементов
  gsap.from('.neon-text', {
    duration: 1.5,
    y: 100,
    opacity: 0,
    ease: 'power4.out'
  })
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  window.removeEventListener('resize', () => {})
})
</script>

<style lang="scss" scoped>
.cyberpunk-portal {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: #000;
  overflow: hidden;
}

.portal-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.5;
  z-index: 1;
}

.portal-content {
  position: relative;
  z-index: 2;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.portal-title {
  text-align: center;
  margin-bottom: 4rem;
}

.neon-text {
  font-size: clamp(3rem, 10vw, 8rem);
  font-weight: 900;
  text-transform: uppercase;
  color: #fff;
  text-shadow: 
    0 0 5px #fff,
    0 0 10px #fff,
    0 0 20px #ff00ff,
    0 0 30px #ff00ff,
    0 0 40px #ff00ff,
    0 0 55px #ff00ff,
    0 0 70px #ff00ff;
  animation: neon-pulse 1.5s ease-in-out infinite alternate;
}

.portal-subtitle {
  font-size: clamp(1rem, 3vw, 1.5rem);
  color: #00ffff;
  opacity: 0.8;
  margin-top: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5em;
  text-shadow: 0 0 10px #00ffff;
}

.portal-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: var(--size);
  height: var(--size);
  left: var(--x);
  top: var(--y);
  background: #ff00ff;
  border-radius: 50%;
  opacity: 0.5;
  animation: float var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
  filter: blur(1px);
}

@keyframes neon-pulse {
  from {
    text-shadow: 
      0 0 5px #fff,
      0 0 10px #fff,
      0 0 20px #ff00ff,
      0 0 30px #ff00ff,
      0 0 40px #ff00ff,
      0 0 55px #ff00ff,
      0 0 70px #ff00ff;
  }
  to {
    text-shadow: 
      0 0 2.5px #fff,
      0 0 5px #fff,
      0 0 10px #ff00ff,
      0 0 15px #ff00ff,
      0 0 20px #ff00ff,
      0 0 27.5px #ff00ff,
      0 0 35px #ff00ff;
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1) rotate(0deg);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-20px) scale(1.2) rotate(180deg);
    opacity: 0.8;
  }
}

@media (max-width: 768px) {
  .neon-text {
    font-size: clamp(2rem, 8vw, 4rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

.cyber-grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
  gap: 1rem;
  position: relative;
}

.cyber-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 180px;
  
  &.left-column {
    align-items: flex-end;
  }
  
  &.right-column {
    align-items: flex-start;
  }
}

.portal-center {
  position: relative;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.center-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, #ff00ff 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(10px);
  opacity: 0.6;
  animation: center-pulse 3s ease-in-out infinite alternate;
}

.center-icon {
  font-size: 1.5rem;
  color: #fff;
  text-shadow: 0 0 10px #ff00ff;
  animation: icon-float 3s ease-in-out infinite alternate;
}

.cyber-item {
  width: 100%;
  position: relative;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: item-appear 0.5s ease-out forwards;
  animation-delay: var(--delay);
  opacity: 0;
  
  &::before {
    content: '';
    position: absolute;
    inset: -1px;
    background: linear-gradient(45deg, #ff00ff, #00ffff);
    z-index: -1;
    opacity: 0.5;
    transition: opacity 0.3s ease;
  }
}

.item-content {
  position: relative;
  background: rgba(0, 0, 0, 0.9);
  padding: 0.5rem 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  box-shadow: 0 0 10px rgba(255, 0, 255, 0.1);
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
  width: 100%;
  border-radius: 4px;
  min-height: 40px;
}

.item-icon {
  font-size: 1.4rem;
  color: #00ffff;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.4);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 0 3px rgba(0, 255, 255, 0.2));
  transform-origin: center;
  flex-shrink: 0;
}

.item-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #00ffff;
  text-shadow: 0 0 3px rgba(0, 255, 255, 0.3);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.item-connection {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1px;
  height: 40px;
  background: linear-gradient(to top, 
    #ff00ff,
    rgba(255, 0, 255, 0.2),
    transparent
  );
  transform-origin: top;
  opacity: 0.2;
  pointer-events: none;
}

.cyber-item:hover {
  transform: translateY(-2px);
  
  .item-content {
    box-shadow: 0 0 15px rgba(255, 0, 255, 0.2);
  }
  
  &::before {
    opacity: 0.8;
  }
  
  .item-icon {
    transform: scale(1.2) rotate(360deg);
    filter: brightness(1.2) drop-shadow(0 0 8px rgba(0, 255, 255, 0.4));
  }
  
  .item-title {
    text-shadow: 0 0 5px rgba(0, 255, 255, 0.5);
  }
}

@keyframes center-pulse {
  from {
    transform: scale(1);
    opacity: 0.6;
  }
  to {
    transform: scale(1.2);
    opacity: 0.8;
  }
}

@keyframes icon-float {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-10px);
  }
}

@keyframes item-appear {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.8);
    filter: brightness(0.5) blur(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: brightness(1) blur(0);
  }
}

@media (max-width: 900px) {
  .cyber-grid {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }
  
  .cyber-column {
    max-width: 160px;
    width: 100%;
    
    &.left-column,
    &.right-column {
      align-items: center;
    }
  }
  
  .portal-center {
    order: -1;
    margin-bottom: 1rem;
  }
}

@media (max-width: 600px) {
  .cyber-grid {
    gap: 1rem;
  }
  
  .cyber-column {
    max-width: 140px;
  }

  .item-content {
    padding: 0.4rem;
    gap: 0.6rem;
  }

  .item-icon {
    font-size: 1.2rem;
  }

  .item-title {
    font-size: 0.8rem;
  }
}
</style> 