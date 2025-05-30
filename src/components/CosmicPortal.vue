<template>
  <section class="cosmic-portal" ref="portalRef">
    <InteractiveEffects
      :colors="['#4b0082', '#9400d3', '#8a2be2', '#9370db', '#7b68ee']"
      :maxRipples="6"
      :maxTrails="30"
      :maxWaves="4"
    />
    <canvas ref="portalCanvas" class="portal-canvas"></canvas>
    
    <div class="portal-content" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 1000 } }">
      <div class="portal-title">
        <h2 class="cosmic-text" data-text="КОСМИЧЕСКИЙ">КОСМИЧЕСКИЙ</h2>
        <div class="portal-subtitle">ПОРТАЛ</div>
      </div>

      <div class="portal-orbit">
        
        <div v-for="(item, index) in portalItems" :key="index"
          class="orbit-item"
          :style="{
            '--angle': `${(index * 360) / portalItems.length}deg`,
            '--delay': `${index * 0.2}s`
          }"
          @mouseenter="onItemHover(index)"
          @mouseleave="onItemLeave(index)"
          @click.stop="handleItemClick($event, index)"
        >
          <div class="item-content">
            <div class="item-icon">{{ item.icon }}</div>
            <div class="item-info">
              <h3 class="item-title">{{ item.title }}</h3>
              <p class="item-description">{{ item.description }}</p>
            </div>
          </div>
          <div class="orbit-path"></div>
        </div>
      </div>

      <div class="portal-particles">
        <div v-for="n in 200" :key="n" class="particle"
          :style="{
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`,
            '--size': `${Math.random() * 3 + 1}px`,
            '--duration': `${Math.random() * 4 + 3}s`,
            '--delay': `${Math.random() * 2}s`,
            '--color': `hsl(${Math.random() * 60 + 240}, 100%, 70%)`
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

const portalRef = ref<HTMLElement | null>(null)
const portalCanvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let animationFrame: number
let time = 0

const portalItems = [
  {
    icon: '🌠',
    title: 'ЗВЕЗДЫ',
    description: 'Сияющие светила'
  },
  {
    icon: '🌍',
    title: 'ПЛАНЕТЫ',
    description: 'Таинственные миры'
  },
  {
    icon: '🚀',
    title: 'ПОЛЕТ',
    description: 'Космические путешествия'
  },
  {
    icon: '🌑',
    title: 'ТЬМА',
    description: 'Тайны вселенной'
  },
  {
    icon: '✨',
    title: 'ЭНЕРГИЯ',
    description: 'Космические силы'
  }
]

// Класс для звезд
class Star {
  x: number
  y: number
  size: number
  speed: number
  brightness: number
  color: string

  constructor(canvas: HTMLCanvasElement) {
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.size = Math.random() * 2 + 1
    this.speed = Math.random() * 0.5 + 0.1
    this.brightness = Math.random() * 0.5 + 0.5
    this.color = `hsl(${Math.random() * 60 + 240}, 100%, ${this.brightness * 100}%)`
  }

  update(canvas: HTMLCanvasElement) {
    this.y += this.speed
    if (this.y > canvas.height) {
      this.y = 0
      this.x = Math.random() * canvas.width
    }
  }

  draw(ctx: CanvasRenderingContext2D | null) {
    if (!ctx) return
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.fill()
  }
}

// Класс для гравитационных волн
class Wave {
  x: number
  y: number
  radius: number
  opacity: number
  speed: number
  color: string

  constructor(canvas: HTMLCanvasElement) {
    this.x = canvas.width / 2
    this.y = canvas.height / 2
    this.radius = 0
    this.opacity = 1
    this.speed = Math.random() * 2 + 1
    this.color = `hsl(${Math.random() * 60 + 240}, 100%, 70%)`
  }

  update() {
    this.radius += this.speed
    this.opacity -= 0.005
  }

  draw(ctx: CanvasRenderingContext2D | null) {
    if (!ctx) return
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.strokeStyle = `${this.color}${Math.floor(this.opacity * 255).toString(16).padStart(2, '0')}`
    ctx.lineWidth = 2
    ctx.stroke()
  }
}

let stars: Star[] = []
let waves: Wave[] = []

const initPortal = () => {
  if (!portalCanvas.value) return
  
  const canvas = portalCanvas.value
  ctx = canvas.getContext('2d')
  if (!ctx) return

  const resizeCanvas = () => {
    if (!canvas || !ctx) return
    const container = canvas.parentElement
    if (!container) return

    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Пересоздаем звезды при изменении размера
    stars = Array.from({ length: 200 }, () => new Star(canvas))
  }

  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  const draw = () => {
    if (!ctx || !canvas) return

    time += 0.01
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Обновляем и рисуем волны
    waves = waves.filter(wave => wave.opacity > 0)
    if (Math.random() < 0.02) {
      waves.push(new Wave(canvas))
    }
    waves.forEach(wave => {
      wave.update()
      wave.draw(ctx)
    })

    // Обновляем и рисуем звезды
    stars.forEach(star => {
      star.update(canvas)
      star.draw(ctx)
    })

    // Рисуем центральный портал
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.2

    // Градиент для портала
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, maxRadius
    )
    gradient.addColorStop(0, 'rgba(75, 0, 130, 0.8)')
    gradient.addColorStop(0.5, 'rgba(148, 0, 211, 0.4)')
    gradient.addColorStop(1, 'rgba(75, 0, 130, 0)')

    ctx.beginPath()
    ctx.arc(centerX, centerY, maxRadius, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()

    // Добавляем вращение портала
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate(time * 0.5)
    ctx.beginPath()
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const x = Math.cos(angle) * maxRadius
      const y = Math.sin(angle) * maxRadius
      ctx.moveTo(0, 0)
      ctx.lineTo(x, y)
    }
    ctx.strokeStyle = 'rgba(147, 112, 219, 0.3)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.restore()

    animationFrame = requestAnimationFrame(draw)
  }

  draw()
}

const onItemHover = (index: number) => {
  const item = document.querySelectorAll('.orbit-item')[index]
  if (!item) return

  gsap.to(item, {
    scale: 1.1,
    duration: 0.4,
    ease: 'power2.out'
  })

  const icon = item.querySelector('.item-icon')
  if (icon) {
    gsap.to(icon, {
      scale: 1.3,
      rotation: 360,
      duration: 0.6,
      ease: 'back.out(1.7)'
    })
  }
}

const onItemLeave = (index: number) => {
  const item = document.querySelectorAll('.orbit-item')[index]
  if (!item) return

  gsap.to(item, {
    scale: 1,
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
}

const handleItemClick = (event: MouseEvent, index: number) => {
  const target = event.currentTarget as HTMLElement
  if (!target) return
  
  const x = event.clientX
  const y = event.clientY
  
  const colors = ['#4b0082', '#9400d3', '#8a2be2', '#9370db', '#7b68ee']
  const color = colors[index % colors.length]
  
  // Создаем эффект клика
  createClickEffect(x, y, color)
  
  // Анимация блока
  const item = target
  const icon = item.querySelector('.item-icon') as HTMLElement
  const title = item.querySelector('.item-title') as HTMLElement
  const description = item.querySelector('.item-description') as HTMLElement
  
  // Создаем волну
  const wave = document.createElement('div')
  wave.style.cssText = `
    position: absolute;
    inset: 0;
    border-radius: 15px;
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
  
  // Анимация самого блока
  gsap.timeline()
    .to(item, {
      scale: 0.95,
      boxShadow: `
        0 0 30px ${color}40,
        0 0 60px ${color}20,
        0 0 90px ${color}10
      `,
      duration: 0.3,
      ease: 'power2.out'
    })
    .to(item, {
      scale: 1,
      boxShadow: '0 0 20px rgba(75, 0, 130, 0.2)',
      duration: 0.4,
      ease: 'elastic.out(1, 0.5)'
    })
}

// Функция для создания эффекта при клике
const createClickEffect = (x: number, y: number, color: string = '#4b0082') => {
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

  // Создаем частицы
  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('div')
    const angle = (Math.PI * 2 * i) / 12
    const size = Math.random() * 4 + 2
    
    particle.style.cssText = `
      position: absolute;
      left: 50%;
      top: 50%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.8;
    `
    effect.appendChild(particle)

    gsap.to(particle, {
      x: Math.cos(angle) * 100,
      y: Math.sin(angle) * 100,
      opacity: 0,
      scale: 0,
      duration: 0.8,
      ease: 'power2.out',
      delay: 0.1
    })
  }

  setTimeout(() => {
    if (effect.parentNode) {
      effect.parentNode.removeChild(effect)
    }
  }, 1000)
}

onMounted(() => {
  initPortal()

  // Анимация появления элементов
  gsap.from('.cosmic-text', {
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
.cosmic-portal {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: #000;
  overflow: hidden;
}

.portal-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.8;
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

.cosmic-text {
  font-size: clamp(3rem, 10vw, 8rem);
  font-weight: 900;
  text-transform: uppercase;
  color: #fff;
  text-shadow: 
    0 0 5px #fff,
    0 0 10px #4b0082,
    0 0 20px #4b0082,
    0 0 30px #4b0082,
    0 0 40px #4b0082,
    0 0 55px #4b0082,
    0 0 70px #4b0082;
  animation: cosmic-pulse 2s ease-in-out infinite alternate;
}

.portal-subtitle {
  font-size: clamp(1rem, 3vw, 1.5rem);
  color: #9370db;
  opacity: 0.8;
  margin-top: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5em;
  text-shadow: 0 0 10px #9370db;
}

.portal-orbit {
  position: relative;
  width: 800px;
  height: 800px;
  margin: 2rem auto;
  animation: orbit-rotate 60s linear infinite;
}

.orbit-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.center-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, #4b0082 0%, transparent 70%);
  border-radius: 50%;
  filter: blur(20px);
  opacity: 0.6;
  animation: center-pulse 3s ease-in-out infinite alternate;
}

.center-icon {
  font-size: 3rem;
  color: #fff;
  text-shadow: 0 0 20px #4b0082;
  animation: icon-float 3s ease-in-out infinite alternate;
}

.orbit-item {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 200px;
  transform-origin: -100px 0;
  transform: rotate(var(--angle)) translateX(300px) rotate(calc(var(--angle) * -1));
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: item-appear 0.5s ease-out forwards;
  animation-delay: var(--delay);
  opacity: 0;
}

.orbit-path {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 600px;
  height: 600px;
  border: 1px solid rgba(75, 0, 130, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border: 1px solid rgba(75, 0, 130, 0.1);
    border-radius: 50%;
    animation: path-glow 4s ease-in-out infinite alternate;
  }
}

.item-content {
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #4b0082;
  border-radius: 15px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 0 20px rgba(75, 0, 130, 0.2);
  backdrop-filter: blur(5px);
  transform: rotate(calc(var(--angle) * -1));
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 0 30px rgba(75, 0, 130, 0.4);
    border-color: #9370db;
  }
}

.item-icon {
  font-size: 2rem;
  color: #9370db;
  text-shadow: 0 0 10px rgba(147, 112, 219, 0.5);
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.item-info {
  flex: 1;
  text-align: left;
}

.item-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #9370db;
  margin-bottom: 0.3rem;
  text-shadow: 0 0 5px rgba(147, 112, 219, 0.5);
}

.item-description {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.3;
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
  background: var(--color);
  border-radius: 50%;
  opacity: 0.5;
  animation: float var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
  filter: blur(1px);
}

@keyframes cosmic-pulse {
  from {
    text-shadow: 
      0 0 5px #fff,
      0 0 10px #4b0082,
      0 0 20px #4b0082,
      0 0 30px #4b0082,
      0 0 40px #4b0082,
      0 0 55px #4b0082,
      0 0 70px #4b0082;
  }
  to {
    text-shadow: 
      0 0 2.5px #fff,
      0 0 5px #4b0082,
      0 0 10px #4b0082,
      0 0 15px #4b0082,
      0 0 20px #4b0082,
      0 0 27.5px #4b0082,
      0 0 35px #4b0082;
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

@keyframes orbit-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
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

@keyframes path-glow {
  from {
    box-shadow: 0 0 20px rgba(75, 0, 130, 0.1);
  }
  to {
    box-shadow: 0 0 40px rgba(75, 0, 130, 0.2);
  }
}

@keyframes item-appear {
  from {
    opacity: 0;
    transform: rotate(var(--angle)) translateX(200px) rotate(calc(var(--angle) * -1)) scale(0.8);
  }
  to {
    opacity: 1;
    transform: rotate(var(--angle)) translateX(300px) rotate(calc(var(--angle) * -1)) scale(1);
  }
}

@media (max-width: 900px) {
  .portal-orbit {
    width: 600px;
    height: 600px;
  }

  .orbit-item {
    transform: rotate(var(--angle)) translateX(200px) rotate(calc(var(--angle) * -1));
  }

  .orbit-path {
    width: 400px;
    height: 400px;
  }
}

@media (max-width: 600px) {
  .portal-orbit {
    width: 400px;
    height: 400px;
  }

  .orbit-item {
    transform: rotate(var(--angle)) translateX(150px) rotate(calc(var(--angle) * -1));
  }

  .orbit-path {
    width: 300px;
    height: 300px;
  }

  .item-content {
    padding: 0.8rem;
  }

  .item-icon {
    font-size: 1.5rem;
  }

  .item-title {
    font-size: 1rem;
  }

  .item-description {
    font-size: 0.7rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style> 