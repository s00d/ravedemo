<template>
  <section class="matrix-section" ref="sectionRef">
    <InteractiveEffects :colors="['#00ff00', '#00ffff', '#ff00ff', '#ffff00']" :maxRipples="4" :maxTrails="20" :maxWaves="3" />
    <canvas ref="matrixCanvas" class="matrix-canvas"></canvas>
    
    <div class="matrix-content" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 1000 } }">
      <div class="matrix-title">
        <h2 class="glitch-text" data-text="МАТРИЦА">МАТРИЦА</h2>
        <div class="matrix-subtitle">Выберите свою реальность</div>
      </div>

      <div class="matrix-grid">
        <div v-for="(item, index) in matrixItems" :key="index"
          class="matrix-item"
          :style="{ '--delay': `${index * 0.1}s` }"
          @mouseenter="onItemHover(index)"
          @mouseleave="onItemLeave(index)"
        >
          <div class="item-content">
            <div class="item-icon">{{ item.icon }}</div>
            <h3 class="item-title">{{ item.title }}</h3>
            <p class="item-description">{{ item.description }}</p>
          </div>
          <div class="item-matrix-code"></div>
          <div class="item-glow"></div>
        </div>
      </div>

      <div class="matrix-particles">
        <div v-for="n in 50" :key="n" class="particle"
          :style="{
            '--x': `${Math.random() * 100}%`,
            '--y': `${Math.random() * 100}%`,
            '--size': `${Math.random() * 4 + 2}px`,
            '--duration': `${Math.random() * 3 + 2}s`,
            '--delay': `${Math.random() * 2}s`
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
const matrixCanvas = ref<HTMLCanvasElement | null>(null)
let animationFrame: number | null = null
let ctx: CanvasRenderingContext2D | null = null
let matrixParticles: Array<{ x: number; y: number; vx: number; vy: number; char: string; life: number }> = []
let mouseTrail: Array<{ x: number; y: number; life: number }> = []
let isInitialized = false

const matrixItems = [
  {
    icon: '🔮',
    title: 'РЕАЛЬНОСТЬ',
    description: 'Выберите свою реальность'
  },
  {
    icon: '🌐',
    title: 'МАТРИЦА',
    description: 'Погрузитесь в цифровой мир'
  },
  {
    icon: '⚡',
    title: 'ЭНЕРГИЯ',
    description: 'Управляйте энергией матрицы'
  },
  {
    icon: '🔍',
    title: 'ПОИСК',
    description: 'Найдите свой путь'
  },
  {
    icon: '💾',
    title: 'ДАННЫЕ',
    description: 'Поток цифровой информации'
  },
  {
    icon: '🔐',
    title: 'КОД',
    description: 'Расшифруйте матрицу'
  },
]

const createMatrixParticles = (x: number, y: number) => {
  for (let i = 0; i < 20; i++) {
    const angle = (Math.PI * 2 * i) / 20
    const speed = Math.random() * 5 + 2
    matrixParticles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      char: String.fromCharCode(0x30A0 + Math.random() * 96),
      life: 1
    })
  }
}

const updateMatrixParticles = () => {
  if (!ctx || !matrixCanvas.value) return

  matrixParticles = matrixParticles.filter(particle => {
    particle.x += particle.vx
    particle.y += particle.vy
    particle.life -= 0.02

    if (particle.life > 0 && ctx) {
      ctx.fillStyle = `rgba(0, 255, 0, ${particle.life})`
      ctx.font = '14px monospace'
      ctx.fillText(particle.char, particle.x, particle.y)
      return true
    }
    return false
  })
}

const handleClick = (e: MouseEvent) => {
  if (!matrixCanvas.value || !sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  // Создаем частицы только если клик был внутри секции матрицы
  if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
    createMatrixParticles(x, y)
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (!matrixCanvas.value || !sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  // Добавляем точку в след только если курсор находится над секцией матрицы
  if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
    mouseTrail.push({ x, y, life: 1 })

    // Ограничиваем длину следа
    if (mouseTrail.length > 20) {
      mouseTrail.shift()
    }

    // Добавляем параллакс эффект для блоков
    const mouseX = x / rect.width
    const mouseY = y / rect.height

    gsap.to('.matrix-item', {
      x: (mouseX - 0.5) * 30,
      y: (mouseY - 0.5) * 30,
      rotationX: (mouseY - 0.5) * 10,
      rotationY: (mouseX - 0.5) * 10,
      duration: 1.2,
      ease: 'power2.out',
      stagger: {
        amount: 0.3,
        from: 'random'
      }
    })
  }
}

const drawMatrixTrail = () => {
  if (!ctx || !matrixCanvas.value) return

  mouseTrail = mouseTrail.filter(point => {
    point.life -= 0.05
    if (point.life > 0 && ctx) {
      ctx.fillStyle = `rgba(0, 255, 0, ${point.life})`
      ctx.font = '14px monospace'
      const char = String.fromCharCode(0x30A0 + Math.random() * 96)
      ctx.fillText(char, point.x, point.y)
      return true
    }
    return false
  })
}

const initMatrix = () => {
  if (!matrixCanvas.value || isInitialized) return
  
  const canvas = matrixCanvas.value
  ctx = canvas.getContext('2d')
  if (!ctx) return

  // Устанавливаем размер canvas равным размеру секции
  const updateCanvasSize = () => {
    if (!canvas || !sectionRef.value) return
    const rect = sectionRef.value.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
  }

  // Инициализируем размер и добавляем обработчик изменения размера окна
  updateCanvasSize()
  window.addEventListener('resize', updateCanvasSize)

  // Создаем начальные частицы матрицы
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const char = String.fromCharCode(0x30A0 + Math.random() * 96)
    matrixParticles.push({
      x,
      y,
      vx: 0,
      vy: Math.random() * 2 + 1,
      char,
      life: 1
    })
  }

  isInitialized = true
}

const startAnimation = () => {
  if (animationFrame) return

  const draw = () => {
    if (!ctx || !matrixCanvas.value) return

    // Очищаем canvas с небольшим затуханием
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.fillRect(0, 0, matrixCanvas.value.width, matrixCanvas.value.height)

    // Обновляем и рисуем частицы матрицы
    matrixParticles = matrixParticles.filter(particle => {
      particle.y += particle.vy
      
      // Если частица вышла за пределы экрана, возвращаем её вверх
      if (particle.y > matrixCanvas.value!.height) {
        particle.y = 0
        particle.x = Math.random() * matrixCanvas.value!.width
      }

      if (ctx) {
        ctx.fillStyle = `rgba(0, 255, 0, ${particle.life})`
        ctx.font = '14px monospace'
        ctx.fillText(particle.char, particle.x, particle.y)
        return true
      }
      return false
    })

    // Обновляем и рисуем след мыши
    mouseTrail = mouseTrail.filter(point => {
      point.life -= 0.05
      if (point.life > 0 && ctx) {
        ctx.fillStyle = `rgba(0, 255, 0, ${point.life})`
        ctx.font = '14px monospace'
        const char = String.fromCharCode(0x30A0 + Math.random() * 96)
        ctx.fillText(char, point.x, point.y)
        return true
      }
      return false
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
  if (matrixCanvas.value) {
    matrixCanvas.value.removeEventListener('click', handleClick)
    matrixCanvas.value.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('resize', () => {})
  }
  matrixParticles = []
  mouseTrail = []
  isInitialized = false
}

const onItemHover = (index: number) => {
  const item = document.querySelectorAll('.matrix-item')[index]
  if (!item) return

  gsap.to(item, {
    scale: 1.05,
    duration: 0.3,
    ease: 'power2.out'
  })

  gsap.to(item.querySelector('.item-glow'), {
    opacity: 1,
    scale: 1.2,
    duration: 0.3
  })

  gsap.to(item.querySelector('.item-matrix-code'), {
    opacity: 1,
    duration: 0.3
  })
}

const onItemLeave = (index: number) => {
  const item = document.querySelectorAll('.matrix-item')[index]
  if (!item) return

  gsap.to(item, {
    scale: 1,
    duration: 0.3
  })

  gsap.to(item.querySelector('.item-glow'), {
    opacity: 0.5,
    scale: 1,
    duration: 0.3
  })

  gsap.to(item.querySelector('.item-matrix-code'), {
    opacity: 0,
    duration: 0.3
  })
}

const onBlockHover = (index: number) => {
  const block = document.querySelectorAll('.matrix-block')[index]
  if (!block) return

  gsap.to(block, {
    scale: 1.05,
    duration: 0.3,
    ease: 'power2.out'
  })

  gsap.to(block.querySelector('.block-glow'), {
    opacity: 1,
    scale: 1.2,
    duration: 0.3
  })

  gsap.to(block.querySelector('.block-particles'), {
    opacity: 1,
    scale: 1,
    duration: 0.3
  })

  gsap.to(block.querySelector('.block-grid'), {
    opacity: 0.5,
    duration: 0.3
  })
}

const onBlockLeave = (index: number) => {
  const block = document.querySelectorAll('.matrix-block')[index]
  if (!block) return

  gsap.to(block, {
    scale: 1,
    duration: 0.3
  })

  gsap.to(block.querySelector('.block-glow'), {
    opacity: 0.5,
    scale: 1,
    duration: 0.3
  })

  gsap.to(block.querySelector('.block-particles'), {
    opacity: 0,
    scale: 0.8,
    duration: 0.3
  })

  gsap.to(block.querySelector('.block-grid'), {
    opacity: 0,
    duration: 0.3
  })
}

onMounted(() => {
  initMatrix()
  if (matrixCanvas.value) {
    matrixCanvas.value.addEventListener('click', handleClick)
    matrixCanvas.value.addEventListener('mousemove', handleMouseMove)
  }
  startAnimation()

  // Анимация появления элементов
  gsap.from('.glitch-text', {
    duration: 1,
    y: 100,
    opacity: 0,
    ease: 'power4.out'
  })

  // Анимация появления блоков матрицы
  gsap.fromTo('.matrix-item', 
    {
      scale: 0.8,
      opacity: 0,
      y: 50,
      rotationX: 45,
      rotationY: 45
    },
    {
      scale: 1,
      opacity: 1,
      y: 0,
      rotationX: 0,
      rotationY: 0,
      duration: 1,
      stagger: 0.15,
      delay: 0.5,
      ease: 'power2.out',
      clearProps: 'all'
    }
  )
})

onUnmounted(() => {
  cleanup()
})
</script>

<style lang="scss" scoped>
.matrix-section {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: #000;
  overflow: hidden;
}

.matrix-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.5;
  z-index: 1;
  pointer-events: none;
  mix-blend-mode: screen;
}

.matrix-content {
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

.matrix-title {
  text-align: center;
  margin-bottom: 4rem;
}

.glitch-text {
  font-size: clamp(3rem, 10vw, 8rem);
  font-weight: 900;
  text-transform: uppercase;
  color: #0F0;
  text-shadow: 
    0 0 5px #0F0,
    0 0 10px #0F0,
    0 0 20px #0F0;
  position: relative;
  animation: glitch 2s infinite;

  &::before,
  &::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  &::before {
    left: 2px;
    text-shadow: -2px 0 #ff00ff;
    clip: rect(44px, 450px, 56px, 0);
    animation: glitch-anim 5s infinite linear alternate-reverse;
  }

  &::after {
    left: -2px;
    text-shadow: -2px 0 #00ffff;
    clip: rect(44px, 450px, 56px, 0);
    animation: glitch-anim2 5s infinite linear alternate-reverse;
  }
}

.matrix-subtitle {
  font-size: clamp(1rem, 3vw, 1.5rem);
  color: #0F0;
  opacity: 0.8;
  margin-top: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5em;
}

.matrix-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
}

.matrix-item {
  position: relative;
  background: rgba(0, 255, 0, 0.05);
  border: 1px solid rgba(0, 255, 0, 0.2);
  border-radius: 10px;
  padding: 2rem;
  color: #0F0;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, transparent, rgba(0, 255, 0, 0.1), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }

  &:hover::before {
    transform: translateX(100%);
  }
}

.item-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.item-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.item-title {
  font-size: 1.5rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #0F0;
  text-shadow: 0 0 5px #0F0;
}

.item-description {
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.8;
}

.item-matrix-code {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 255, 0, 0.1) 2px,
    rgba(0, 255, 0, 0.1) 4px
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.item-glow {
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle at center,
    rgba(0, 255, 0, 0.5) 0%,
    transparent 70%);
  opacity: 0.5;
  filter: blur(20px);
  transition: all 0.3s ease;
  z-index: 1;
}

.matrix-particles {
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
  background: #0F0;
  border-radius: 50%;
  opacity: 0.5;
  animation: float var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
}

@keyframes glitch {
  0% {
    text-shadow: 
      0.05em 0 0 #ff00ff,
      -0.05em -0.025em 0 #00ffff,
      -0.025em 0.05em 0 #0F0;
  }
  14% {
    text-shadow: 
      0.05em 0 0 #ff00ff,
      -0.05em -0.025em 0 #00ffff,
      -0.025em 0.05em 0 #0F0;
  }
  15% {
    text-shadow: 
      -0.05em -0.025em 0 #ff00ff,
      0.025em 0.025em 0 #00ffff,
      -0.05em -0.05em 0 #0F0;
  }
  49% {
    text-shadow: 
      -0.05em -0.025em 0 #ff00ff,
      0.025em 0.025em 0 #00ffff,
      -0.05em -0.05em 0 #0F0;
  }
  50% {
    text-shadow: 
      0.025em 0.05em 0 #ff00ff,
      0.05em 0 0 #00ffff,
      0 -0.05em 0 #0F0;
  }
  99% {
    text-shadow: 
      0.025em 0.05em 0 #ff00ff,
      0.05em 0 0 #00ffff,
      0 -0.05em 0 #0F0;
  }
  100% {
    text-shadow: 
      -0.025em 0 0 #ff00ff,
      -0.025em -0.025em 0 #00ffff,
      -0.025em -0.05em 0 #0F0;
  }
}

@keyframes glitch-anim {
  0% {
    clip: rect(42px, 9999px, 44px, 0);
  }
  5% {
    clip: rect(12px, 9999px, 59px, 0);
  }
  10% {
    clip: rect(48px, 9999px, 29px, 0);
  }
  15% {
    clip: rect(42px, 9999px, 73px, 0);
  }
  20% {
    clip: rect(63px, 9999px, 27px, 0);
  }
  25% {
    clip: rect(34px, 9999px, 55px, 0);
  }
  30% {
    clip: rect(86px, 9999px, 73px, 0);
  }
  35% {
    clip: rect(20px, 9999px, 20px, 0);
  }
  40% {
    clip: rect(26px, 9999px, 60px, 0);
  }
  45% {
    clip: rect(25px, 9999px, 66px, 0);
  }
  50% {
    clip: rect(57px, 9999px, 98px, 0);
  }
  55% {
    clip: rect(5px, 9999px, 46px, 0);
  }
  60% {
    clip: rect(82px, 9999px, 31px, 0);
  }
  65% {
    clip: rect(54px, 9999px, 27px, 0);
  }
  70% {
    clip: rect(28px, 9999px, 99px, 0);
  }
  75% {
    clip: rect(45px, 9999px, 69px, 0);
  }
  80% {
    clip: rect(23px, 9999px, 85px, 0);
  }
  85% {
    clip: rect(54px, 9999px, 84px, 0);
  }
  90% {
    clip: rect(45px, 9999px, 47px, 0);
  }
  95% {
    clip: rect(37px, 9999px, 20px, 0);
  }
  100% {
    clip: rect(4px, 9999px, 91px, 0);
  }
}

@keyframes glitch-anim2 {
  0% {
    clip: rect(65px, 9999px, 100px, 0);
  }
  5% {
    clip: rect(52px, 9999px, 74px, 0);
  }
  10% {
    clip: rect(79px, 9999px, 85px, 0);
  }
  15% {
    clip: rect(75px, 9999px, 5px, 0);
  }
  20% {
    clip: rect(67px, 9999px, 61px, 0);
  }
  25% {
    clip: rect(14px, 9999px, 79px, 0);
  }
  30% {
    clip: rect(1px, 9999px, 66px, 0);
  }
  35% {
    clip: rect(86px, 9999px, 30px, 0);
  }
  40% {
    clip: rect(23px, 9999px, 98px, 0);
  }
  45% {
    clip: rect(85px, 9999px, 72px, 0);
  }
  50% {
    clip: rect(71px, 9999px, 75px, 0);
  }
  55% {
    clip: rect(2px, 9999px, 48px, 0);
  }
  60% {
    clip: rect(30px, 9999px, 16px, 0);
  }
  65% {
    clip: rect(59px, 9999px, 50px, 0);
  }
  70% {
    clip: rect(41px, 9999px, 62px, 0);
  }
  75% {
    clip: rect(2px, 9999px, 82px, 0);
  }
  80% {
    clip: rect(47px, 9999px, 73px, 0);
  }
  85% {
    clip: rect(3px, 9999px, 27px, 0);
  }
  90% {
    clip: rect(26px, 9999px, 55px, 0);
  }
  95% {
    clip: rect(42px, 9999px, 97px, 0);
  }
  100% {
    clip: rect(38px, 9999px, 49px, 0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-20px) scale(1.2);
    opacity: 0.8;
  }
}

@media (max-width: 768px) {
  .matrix-grid {
    grid-template-columns: 1fr;
    max-width: 500px;
  }

  .glitch-text {
    font-size: clamp(2rem, 8vw, 4rem);
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style> 