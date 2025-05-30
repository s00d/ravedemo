<template>
  <div class="global-effects" ref="effectsRef">
    <!-- Эффекты при движении мыши -->
    <div class="mouse-trail" ref="trailRef"></div>
    <div class="mouse-glow" ref="glowRef"></div>

    <!-- Эффекты при кликах -->
    <div v-for="(ripple, index) in ripples" :key="`ripple-${index}`"
      class="click-ripple"
      :style="{
        left: `${ripple.x}px`,
        top: `${ripple.y}px`,
        '--color': ripple.color
      }"
    ></div>

    <!-- Эффекты при наведении -->
    <div v-for="(hover, index) in hovers" :key="`hover-${index}`"
      class="hover-effect"
      :style="{
        left: `${hover.x}px`,
        top: `${hover.y}px`,
        '--color': hover.color
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { gsap } from 'gsap'

const props = defineProps<{
  currentSection: string
}>()

const effectsRef = ref<HTMLElement | null>(null)
const trailRef = ref<HTMLElement | null>(null)
const glowRef = ref<HTMLElement | null>(null)

// Состояния для эффектов
const ripples = ref<Array<{ x: number; y: number; color: string }>>([])
const hovers = ref<Array<{ x: number; y: number; color: string }>>([])
let lastScrollY = 0
let scrollDirection = 0
let mouseX = 0
let mouseY = 0
let trailPoints: Array<{ x: number; y: number; life: number }> = []

// Конфигурация эффектов для разных секций
const sectionEffects = {
  hero: {
    colors: ['#ff00ff', '#00ffff', '#ff0000'],
    particleCount: 30,
    trailLength: 20,
    glowSize: 120,
    particleSize: { min: 2, max: 6 },
    animationSpeed: 1
  },
  matrix: {
    colors: ['#00ff00', '#00ffff', '#00ffaa'],
    particleCount: 40,
    trailLength: 15,
    glowSize: 80,
    particleSize: { min: 1, max: 4 },
    animationSpeed: 1.5
  },
  cyberpunk: {
    colors: ['#ff00ff', '#ff0000', '#ff7700'],
    particleCount: 25,
    trailLength: 25,
    glowSize: 150,
    particleSize: { min: 3, max: 8 },
    animationSpeed: 0.8
  },
  sauron: {
    colors: ['#ff0000', '#ff3300', '#ff6600'],
    particleCount: 20,
    trailLength: 30,
    glowSize: 200,
    particleSize: { min: 4, max: 10 },
    animationSpeed: 0.6
  },
  cosmic: {
    colors: ['#00ffff', '#0088ff', '#00ffaa'],
    particleCount: 35,
    trailLength: 18,
    glowSize: 100,
    particleSize: { min: 2, max: 5 },
    animationSpeed: 1.2
  },
  neural: {
    colors: ['#00ff9d', '#00b8ff', '#00ffd5'],
    particleCount: 28,
    trailLength: 22,
    glowSize: 90,
    particleSize: { min: 2, max: 6 },
    animationSpeed: 1.1
  },
  default: {
    colors: ['#ff00ff', '#00ffff', '#ff0000', '#00ff00', '#ffff00'],
    particleCount: 20,
    trailLength: 20,
    glowSize: 100,
    particleSize: { min: 2, max: 4 },
    animationSpeed: 1
  }
}

// Текущие настройки эффектов
const currentEffects = ref(sectionEffects.default)

// Обновляем эффекты при смене секции
watch(() => props.currentSection, (newSection) => {
  const newEffects = sectionEffects[newSection as keyof typeof sectionEffects] || sectionEffects.default
  
  // Плавно меняем настройки
  gsap.to(currentEffects.value, {
    ...newEffects,
    duration: 1,
    ease: 'power2.inOut'
  })

  // Обновляем частицы
  updateParticles()
  
  // Обновляем свечение
  if (glowRef.value) {
    gsap.to(glowRef.value, {
      width: newEffects.glowSize,
      height: newEffects.glowSize,
      duration: 1,
      ease: 'power2.inOut'
    })
  }
})

// Обновление частиц при смене эффектов
const updateParticles = () => {
  const particles = document.querySelectorAll('.scroll-particle')
  particles.forEach(particle => {
    const size = Math.random() * 
      (currentEffects.value.particleSize.max - currentEffects.value.particleSize.min) + 
      currentEffects.value.particleSize.min
    
    gsap.to(particle, {
      width: size,
      height: size,
      duration: 1,
      ease: 'power2.inOut'
    })
  })
}

// Модифицируем создание частиц при скролле
const createScrollParticles = () => {
  const particles = document.querySelectorAll('.scroll-particle')
  particles.forEach(particle => {
    const color = currentEffects.value.colors[Math.floor(Math.random() * currentEffects.value.colors.length)]
    gsap.to(particle, {
      y: scrollDirection > 0 ? '+=100' : '-=100',
      opacity: 0,
      backgroundColor: color,
      duration: currentEffects.value.animationSpeed,
      ease: 'power2.out',
      onComplete: () => {
        gsap.set(particle, {
          y: scrollDirection > 0 ? '-=100' : '+=100',
          opacity: 1
        })
      }
    })
  })
}

// Модифицируем создание эффекта при наведении
const createHoverEffect = (x: number, y: number) => {
  const color = currentEffects.value.colors[Math.floor(Math.random() * currentEffects.value.colors.length)]
  hovers.value.push({ x, y, color })
  
  setTimeout(() => {
    hovers.value.shift()
  }, 500 * currentEffects.value.animationSpeed)
}

// Модифицируем создание частиц при клике
const createClickParticles = (x: number, y: number, color: string) => {
  for (let i = 0; i < currentEffects.value.particleCount; i++) {
    const angle = (Math.PI * 2 * i) / currentEffects.value.particleCount
    const particle = document.createElement('div')
    particle.className = 'click-particle'
    const size = Math.random() * 
      (currentEffects.value.particleSize.max - currentEffects.value.particleSize.min) + 
      currentEffects.value.particleSize.min
    
    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
    `
    document.body.appendChild(particle)

    gsap.to(particle, {
      x: Math.cos(angle) * 100,
      y: Math.sin(angle) * 100,
      opacity: 0,
      scale: 0,
      duration: currentEffects.value.animationSpeed,
      ease: 'power2.out',
      onComplete: () => {
        document.body.removeChild(particle)
      }
    })
  }
}

// Модифицируем анимацию следа мыши
const animateTrail = () => {
  if (!trailRef.value) return

  trailRef.value.innerHTML = ''
  trailPoints.forEach((point, index) => {
    const dot = document.createElement('div')
    dot.className = 'trail-dot'
    const size = currentEffects.value.particleSize.max - 
      (index * (currentEffects.value.particleSize.max - currentEffects.value.particleSize.min) / currentEffects.value.trailLength)
    
    dot.style.cssText = `
      position: fixed;
      left: ${point.x}px;
      top: ${point.y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${currentEffects.value.colors[index % currentEffects.value.colors.length]};
      border-radius: 50%;
      opacity: ${point.life};
      pointer-events: none;
    `
    trailRef.value?.appendChild(dot)
    point.life -= 0.05 * currentEffects.value.animationSpeed
  })

  trailPoints = trailPoints.filter(point => point.life > 0)
  if (trailPoints.length > currentEffects.value.trailLength) {
    trailPoints = trailPoints.slice(-currentEffects.value.trailLength)
  }
  requestAnimationFrame(animateTrail)
}

// Обработчик скролла
const handleScroll = () => {
  const currentScrollY = window.scrollY
  scrollDirection = currentScrollY > lastScrollY ? 1 : -1
  lastScrollY = currentScrollY
}

// Обработчик движения мыши
const handleMouseMove = (e: MouseEvent) => {
  mouseX = e.clientX
  mouseY = e.clientY

  // Обновляем след мыши
  trailPoints.push({ x: mouseX, y: mouseY, life: 1 })
  if (trailPoints.length > 20) {
    trailPoints.shift()
  }

  // Обновляем свечение
  if (glowRef.value) {
    gsap.to(glowRef.value, {
      x: mouseX,
      y: mouseY,
      duration: 0.3,
      ease: 'power2.out'
    })
  }

  // Создаем эффект при быстром движении
  if (Math.abs(e.movementX) > 10 || Math.abs(e.movementY) > 10) {
    createHoverEffect(e.clientX, e.clientY)
  }
}

// Обработчик клика
const handleClick = (e: MouseEvent) => {
  const color = currentEffects.value.colors[Math.floor(Math.random() * currentEffects.value.colors.length)]
  ripples.value.push({ x: e.clientX, y: e.clientY, color })
  
  // Удаляем эффект через анимацию
  setTimeout(() => {
    ripples.value.shift()
  }, 1000)

  // Создаем взрыв частиц
  createClickParticles(e.clientX, e.clientY, color)
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('click', handleClick)
  animateTrail()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('click', handleClick)
})
</script>

<style lang="scss" scoped>
.global-effects {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.mouse-trail {
  position: fixed;
  pointer-events: none;
}

.trail-dot {
  position: fixed;
  border-radius: 50%;
  filter: blur(1px);
  mix-blend-mode: screen;
}

.mouse-glow {
  position: fixed;
  background: radial-gradient(circle at center,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0.4) 30%,
    transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%);
  filter: blur(10px);
  mix-blend-mode: screen;
  opacity: 0.5;
  transition: width 0.3s ease, height 0.3s ease;
}

.click-ripple {
  position: fixed;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: var(--color);
  transform: translate(-50%, -50%);
  animation: ripple 1s ease-out forwards;
  mix-blend-mode: screen;
}

.hover-effect {
  position: fixed;
  width: 20px;
  height: 20px;
  background: var(--color);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: hover 0.5s ease-out forwards;
  mix-blend-mode: screen;
  filter: blur(2px);
}

@keyframes ripple {
  0% {
    width: 0;
    height: 0;
    opacity: 0.8;
  }
  100% {
    width: 200px;
    height: 200px;
    opacity: 0;
  }
}

@keyframes hover {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .global-effects {
    display: none;
  }
}
</style> 