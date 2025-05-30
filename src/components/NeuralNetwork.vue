<template>
  <section class="neural-network" ref="networkRef">
    <canvas ref="networkCanvas" class="network-canvas"></canvas>
    
    <!-- Эффекты при клике -->
    <div v-for="(effect, index) in clickEffects" :key="`click-${index}`"
      class="click-effect"
      :style="{
        left: `${effect.x}px`,
        top: `${effect.y}px`,
        width: `${effect.size}px`,
        height: `${effect.size}px`,
        '--color': effect.color
      }"
    ></div>
    
    <!-- Эффекты при движении мыши -->
    <div v-for="(effect, index) in mouseEffects" :key="`mouse-${index}`"
      class="mouse-effect"
      :style="{
        left: `${effect.x}px`,
        top: `${effect.y}px`,
        opacity: effect.life,
        '--color': effect.color
      }"
    ></div>
    
    <div class="network-content">
      <div class="network-title">
        <h2 class="neural-text" data-text="НЕЙРОСЕТЬ">НЕЙРОСЕТЬ</h2>
        <div class="network-subtitle">СИСТЕМА</div>
      </div>

      <div class="network-grid">
        <div v-for="(item, index) in networkItems" :key="index"
          class="network-item"
          :style="{ '--delay': `${index * 0.1}s` }"
          @mouseenter="onItemHover(index)"
          @mouseleave="onItemLeave(index)"
          @click.stop="handleItemClick($event, index)"
        >
          <div class="item-content">
            <div class="item-icon">{{ item.icon }}</div>
            <h3 class="item-title">{{ item.title }}</h3>
            <p class="item-description">{{ item.description }}</p>
          </div>
          <div class="item-glow"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

const networkRef = ref<HTMLElement | null>(null)
const networkCanvas = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null
let animationFrame: number | null = null
let time = 0
let isInitialized = false

// Добавляем состояние для эффектов
const clickEffects = ref<Array<{ x: number; y: number; color: string; size: number }>>([])
const mouseEffects = ref<Array<{ x: number; y: number; color: string; life: number }>>([])
let lastMouseX = 0
let lastMouseY = 0

// Класс для нейронных узлов
class Node {
  x: number
  y: number
  radius: number
  pulse: number
  connections: Node[]
  color: string
  targetX: number
  targetY: number
  speed: number

  constructor(canvas: HTMLCanvasElement) {
    this.x = Math.random() * canvas.width
    this.y = Math.random() * canvas.height
    this.targetX = this.x
    this.targetY = this.y
    this.radius = Math.random() * 2 + 1
    this.pulse = Math.random() * Math.PI * 2
    this.connections = []
    this.color = `hsl(${Math.random() * 60 + 160}, 100%, 70%)`
    this.speed = Math.random() * 0.5 + 0.2
  }

  update(mouseX: number | null, mouseY: number | null) {
    // Обновляем пульсацию
    this.pulse += 0.02
    if (this.pulse > Math.PI * 2) {
      this.pulse = 0
    }

    // Если есть координаты мыши, добавляем отталкивание
    if (mouseX !== null && mouseY !== null) {
      const dx = this.x - mouseX
      const dy = this.y - mouseY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const maxDistance = 100

      if (distance < maxDistance) {
        const force = (1 - distance / maxDistance) * 2
        this.targetX = this.x + (dx / distance) * force * 10
        this.targetY = this.y + (dy / distance) * force * 10
      } else {
        // Плавно возвращаемся к исходной позиции
        this.targetX = this.x + (this.targetX - this.x) * 0.95
        this.targetY = this.y + (this.targetY - this.y) * 0.95
      }
    }

    // Плавное движение к целевой позиции
    this.x += (this.targetX - this.x) * this.speed * 0.1
    this.y += (this.targetY - this.y) * this.speed * 0.1
  }

  draw(ctx: CanvasRenderingContext2D | null) {
    if (!ctx) return

    // Рисуем связи
    this.connections.forEach(node => {
      const gradient = ctx.createLinearGradient(this.x, this.y, node.x, node.y)
      gradient.addColorStop(0, this.color)
      gradient.addColorStop(1, node.color)
      
      ctx.beginPath()
      ctx.moveTo(this.x, this.y)
      ctx.lineTo(node.x, node.y)
      ctx.strokeStyle = gradient
      ctx.lineWidth = 0.5
      ctx.globalAlpha = 0.3
      ctx.stroke()
    })

    // Рисуем узел
    const pulseSize = Math.sin(this.pulse) * 0.3 + 1
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius * pulseSize, 0, Math.PI * 2)
    ctx.fillStyle = this.color
    ctx.globalAlpha = 0.8
    ctx.fill()

    // Добавляем свечение
    const glow = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.radius * 3
    )
    glow.addColorStop(0, this.color)
    glow.addColorStop(1, 'transparent')
    
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2)
    ctx.fillStyle = glow
    ctx.globalAlpha = 0.3
    ctx.fill()
  }
}

let nodes: Node[] = []
let mouseX: number | null = null
let mouseY: number | null = null

const initNetwork = () => {
  if (!networkCanvas.value || isInitialized) return
  
  const canvas = networkCanvas.value
  ctx = canvas.getContext('2d')
  if (!ctx) return

  const resizeCanvas = () => {
    if (!canvas || !ctx) return
    const container = canvas.parentElement
    if (!container) return

    const rect = container.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    // Создаем новые узлы при изменении размера
    nodes = Array.from({ length: 50 }, () => new Node(canvas))
    
    // Создаем связи между узлами
    nodes.forEach(node => {
      node.connections = nodes
        .filter(n => n !== node)
        .filter(n => {
          const dx = n.x - node.x
          const dy = n.y - node.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          return distance < Math.min(canvas.width, canvas.height) * 0.2
        })
    })
  }

  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
  isInitialized = true
}

const handleMouseMove = (event: MouseEvent) => {
  const rect = networkCanvas.value?.getBoundingClientRect()
  if (!rect) return
  
  mouseX = event.clientX - rect.left
  mouseY = event.clientY - rect.top
}

const handleMouseLeave = () => {
  mouseX = null
  mouseY = null
}

const startAnimation = () => {
  if (animationFrame) return

  const draw = () => {
    if (!ctx || !networkCanvas.value) return

    time += 0.01
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, networkCanvas.value.width, networkCanvas.value.height)

    // Обновляем и рисуем узлы
    nodes.forEach(node => {
      node.update(mouseX, mouseY)
      node.draw(ctx)
    })

    animationFrame = requestAnimationFrame(draw)
  }

  draw()
}

const stopAnimation = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
}

const cleanup = () => {
  stopAnimation()
  if (networkCanvas.value) {
    window.removeEventListener('resize', () => {})
  }
  nodes = []
  isInitialized = false
}

const networkItemsRef = ref<HTMLElement[]>([])

const networkItems = [
  {
    icon: '🧠',
    title: 'ИИ',
    description: 'Самообучающиеся системы'
  },
  {
    icon: '🔍',
    title: 'АНАЛИЗ',
    description: 'Распознавание данных'
  },
  {
    icon: '📊',
    title: 'ПРОГНОЗЫ',
    description: 'Предсказание трендов'
  },
  {
    icon: '🔄',
    title: 'ОБУЧЕНИЕ',
    description: 'Адаптация к данным'
  },
  {
    icon: '🔗',
    title: 'СЕТЬ',
    description: 'Нейронные связи'
  },
  {
    icon: '⚡',
    title: 'СКОРОСТЬ',
    description: 'Быстрая обработка'
  }
]

const onItemHover = (index: number) => {
  const item = document.querySelectorAll('.network-item')[index]
  if (!item) return

  gsap.to(item, {
    scale: 1.02,
    y: -3,
    duration: 0.3,
    ease: 'power2.out'
  })
}

const onItemLeave = (index: number) => {
  const item = document.querySelectorAll('.network-item')[index]
  if (!item) return

  gsap.to(item, {
    scale: 1,
    y: 0,
    duration: 0.3,
    ease: 'power2.out'
  })
}

// Функция для создания эффекта при клике
const createClickEffect = (x: number, y: number, color: string = '#00ff9d') => {
  // Создаем основной элемент
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

  // Создаем внутренний круг
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

  // Удаляем элемент после завершения анимации
  setTimeout(() => {
    if (effect.parentNode) {
      effect.parentNode.removeChild(effect)
    }
  }, 1000)
}

// Функция для создания эффекта при движении мыши
const createMouseEffect = (x: number, y: number) => {
  if (Math.abs(x - lastMouseX) < 5 && Math.abs(y - lastMouseY) < 5) return
  
  const effect = {
    x,
    y,
    color: `hsl(${Math.random() * 60 + 160}, 100%, 70%)`,
    life: 1
  }
  
  mouseEffects.value.push(effect)
  lastMouseX = x
  lastMouseY = y
  
  gsap.to(effect, {
    life: 0,
    duration: 0.5,
    ease: 'power2.out',
    onComplete: () => {
      const index = mouseEffects.value.indexOf(effect)
      if (index > -1) {
        mouseEffects.value.splice(index, 1)
      }
    }
  })
}

// Обработчик клика по блоку
const handleItemClick = (event: MouseEvent, index: number) => {
  const target = event.currentTarget as HTMLElement
  if (!target) return
  
  const x = event.clientX
  const y = event.clientY
  
  const colors = ['#00ff9d', '#00b8ff', '#00ffd5']
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
      duration: 0.3,
      ease: 'power2.out'
    })
    .to(wave, {
      scale: 1.5,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => wave.remove()
    })
  
  // Анимация иконки
  gsap.timeline()
    .to(icon, {
      scale: 1.3,
      rotation: 360,
      duration: 0.5,
      ease: 'back.out(1.7)'
    })
    .to(icon, {
      scale: 1,
      rotation: 0,
      duration: 0.3,
      ease: 'power2.inOut'
    })
  
  // Анимация заголовка
  gsap.timeline()
    .to(title, {
      y: -5,
      textShadow: `0 0 20px ${color}`,
      duration: 0.2,
      ease: 'power2.out'
    })
    .to(title, {
      y: 0,
      textShadow: 'none',
      duration: 0.3,
      ease: 'power2.inOut'
    })
  
  // Анимация описания
  gsap.to(description, {
    opacity: 0.5,
    duration: 0.2,
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
      duration: 0.2,
      ease: 'power2.out'
    })
    .to(item, {
      scale: 1,
      boxShadow: '0 0 20px rgba(0, 255, 157, 0.2)',
      duration: 0.3,
      ease: 'elastic.out(1, 0.5)'
    })
}

// Обработчик движения мыши по фону
const handleBackgroundMouseMove = (event: MouseEvent) => {
  if (!networkCanvas.value) return
  
  const rect = networkCanvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  createMouseEffect(x, y)
}

onMounted(() => {
  initNetwork()
  startAnimation()
  
  if (networkCanvas.value) {
    networkCanvas.value.addEventListener('mousemove', handleBackgroundMouseMove)
  }

  // Анимация появления заголовка
  gsap.from('.neural-text', {
    duration: 1,
    y: 50,
    opacity: 0,
    ease: 'power3.out'
  })
})

onUnmounted(() => {
  cleanup()
  if (networkCanvas.value) {
    networkCanvas.value.removeEventListener('mousemove', handleBackgroundMouseMove)
  }
})
</script>

<style lang="scss" scoped>
.neural-network {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: #000;
  overflow: hidden;
}

.network-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0.5;
  z-index: 1;
  cursor: none;
}

.network-content {
  position: relative;
  z-index: 3;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.network-title {
  text-align: center;
  margin-bottom: 4rem;
}

.neural-text {
  font-size: clamp(3rem, 10vw, 8rem);
  font-weight: 900;
  text-transform: uppercase;
  color: #fff;
  text-shadow: 
    0 0 5px #fff,
    0 0 10px #00ff9d,
    0 0 20px #00ff9d,
    0 0 30px #00ff9d,
    0 0 40px #00ff9d,
    0 0 55px #00ff9d,
    0 0 70px #00ff9d;
  animation: neural-pulse 2s ease-in-out infinite alternate;
}

.network-subtitle {
  font-size: clamp(1rem, 3vw, 1.5rem);
  color: #00ff9d;
  opacity: 0.8;
  margin-top: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5em;
  text-shadow: 0 0 10px #00ff9d;
}

.network-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
}

.network-item {
  position: relative;
  background: rgba(0, 0, 0, 0.95);
  border: 2px solid #00ff9d;
  border-radius: 15px;
  padding: 1.5rem;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: visible; // Меняем на visible чтобы эффекты не обрезались
  cursor: pointer;
  transform-origin: center;
  box-shadow: 0 0 20px rgba(0, 255, 157, 0.2);
  animation: itemAppear 0.5s ease-out forwards;
  animation-delay: var(--delay);
  opacity: 0;
  transform: translateY(20px);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 0.3s ease;
  z-index: 1; // Добавляем z-index
  
  &:hover {
    .item-icon {
      transform: scale(1.1);
    }

    .item-title {
      text-shadow: 0 0 10px #00ff9d;
    }
  }

  &:active {
    transform: scale(0.95);
    box-shadow: 
      0 0 20px rgba(0, 255, 157, 0.8),
      0 0 40px rgba(0, 255, 157, 0.4),
      0 0 60px rgba(0, 255, 157, 0.2);
  }
}

.item-content {
  position: relative;
  z-index: 2;
  width: 100%;
  text-align: center;
}

.item-icon {
  font-size: 2rem;
  margin-bottom: 0.8rem;
  color: #00ff9d;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
              color 0.3s ease;
  text-shadow: 0 0 10px rgba(0, 255, 157, 0.5);
}

.item-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #00ff9d;
  margin-bottom: 0.5rem;
  transition: transform 0.3s ease,
              text-shadow 0.3s ease;
}

.item-description {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
  transition: opacity 0.3s ease;
}

.item-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    rgba(0, 255, 157, 0.1) 0%,
    transparent 70%
  );
  opacity: 0.5;
  transition: opacity 0.3s ease;
  pointer-events: none;
  filter: blur(5px);
  z-index: 1;
}

.item-particles {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
    circle at center,
    rgba(0, 255, 157, 0.3) 0%,
    transparent 60%
  );
  opacity: 0;
  scale: 0.8;
  transition: all 0.4s ease;
  pointer-events: none;
  filter: blur(5px);
  z-index: 1;
}

.network-particles {
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

@keyframes neural-pulse {
  from {
    text-shadow: 
      0 0 5px #fff,
      0 0 10px #00ff9d,
      0 0 20px #00ff9d,
      0 0 30px #00ff9d,
      0 0 40px #00ff9d,
      0 0 55px #00ff9d,
      0 0 70px #00ff9d;
  }
  to {
    text-shadow: 
      0 0 2.5px #fff,
      0 0 5px #00ff9d,
      0 0 10px #00ff9d,
      0 0 15px #00ff9d,
      0 0 20px #00ff9d,
      0 0 27.5px #00ff9d,
      0 0 35px #00ff9d;
  }
}

@keyframes itemAppear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes borderPulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
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
  .neural-text {
    font-size: clamp(2rem, 8vw, 4rem);
  }

  .network-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .network-item {
    padding: 1.5rem;
  }

  .item-icon {
    font-size: 2rem;
  }

  .item-title {
    font-size: 1.2rem;
  }

  .item-description {
    font-size: 0.9rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}

.mouse-effect {
  position: absolute;
  width: 20px;
  height: 20px;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    circle at center,
    var(--color) 0%,
    transparent 70%
  );
  border-radius: 50%;
  pointer-events: none;
  filter: blur(2px);
  mix-blend-mode: screen;
  z-index: 2;
}

.click-effect-container {
  will-change: transform, opacity;
}

.click-effect-main {
  will-change: transform, opacity, width, height;
}

.click-effect-ring {
  will-change: transform, opacity, width, height;
}

.click-effect-particles {
  will-change: transform, opacity;
}
</style> 