<template>
  <div class="interactive-effects" ref="effectsRef">
    <div class="click-ripple" v-for="ripple in ripples" :key="ripple.id"
      :style="{
        left: ripple.x + 'px',
        top: ripple.y + 'px',
        '--size': ripple.size + 'px',
        '--color': ripple.color
      }"
    ></div>
    <div class="mouse-trail" v-for="trail in trails" :key="trail.id"
      :style="{
        left: trail.x + 'px',
        top: trail.y + 'px',
        '--size': trail.size + 'px',
        '--color': trail.color,
        '--delay': trail.delay + 's'
      }"
    ></div>
    <div class="energy-wave" v-for="wave in waves" :key="wave.id"
      :style="{
        left: wave.x + 'px',
        top: wave.y + 'px',
        '--size': wave.size + 'px',
        '--color': wave.color
      }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

const props = defineProps<{
  colors?: string[]
  maxRipples?: number
  maxTrails?: number
  maxWaves?: number
}>()

const effectsRef = ref<HTMLElement | null>(null)
const ripples = ref<Array<{ id: number; x: number; y: number; size: number; color: string }>>([])
const trails = ref<Array<{ id: number; x: number; y: number; size: number; color: string; delay: number }>>([])
const waves = ref<Array<{ id: number; x: number; y: number; size: number; color: string }>>([])

let rippleId = 0
let trailId = 0
let waveId = 0
let lastMouseX = 0
let lastMouseY = 0
let mouseTrailTimeout: number

const defaultColors = [
  '#ff00ff',
  '#00ffff',
  '#ff0000',
  '#00ff00',
  '#0000ff',
  '#ffff00'
]

const colors = props.colors || defaultColors

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)]

const createRipple = (x: number, y: number) => {
  if (ripples.value.length >= (props.maxRipples || 5)) {
    ripples.value.shift()
  }

  const ripple = {
    id: rippleId++,
    x,
    y,
    size: Math.random() * 100 + 50,
    color: getRandomColor()
  }

  ripples.value.push(ripple)

  setTimeout(() => {
    ripples.value = ripples.value.filter(r => r.id !== ripple.id)
  }, 1000)
}

const createTrail = (x: number, y: number) => {
  if (trails.value.length >= (props.maxTrails || 20)) {
    trails.value.shift()
  }

  const trail = {
    id: trailId++,
    x,
    y,
    size: Math.random() * 10 + 5,
    color: getRandomColor(),
    delay: Math.random() * 0.5
  }

  trails.value.push(trail)

  setTimeout(() => {
    trails.value = trails.value.filter(t => t.id !== trail.id)
  }, 1000)
}

const createWave = (x: number, y: number) => {
  if (waves.value.length >= (props.maxWaves || 3)) {
    waves.value.shift()
  }

  const wave = {
    id: waveId++,
    x,
    y,
    size: Math.random() * 200 + 100,
    color: getRandomColor()
  }

  waves.value.push(wave)

  setTimeout(() => {
    waves.value = waves.value.filter(w => w.id !== wave.id)
  }, 2000)
}

const handleClick = (e: MouseEvent) => {
  if (!effectsRef.value) return

  const rect = effectsRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  createRipple(x, y)
  createWave(x, y)

  // Создаем эффект разлетающихся частиц
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * 2 * i) / 10
    const distance = Math.random() * 100 + 50
    const particleX = x + Math.cos(angle) * distance
    const particleY = y + Math.sin(angle) * distance

    gsap.to(document.createElement('div'), {
      x: particleX - x,
      y: particleY - y,
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
      onStart: (target) => {
        target.style.position = 'absolute'
        target.style.left = x + 'px'
        target.style.top = y + 'px'
        target.style.width = '4px'
        target.style.height = '4px'
        target.style.background = getRandomColor()
        target.style.borderRadius = '50%'
        effectsRef.value?.appendChild(target)
      },
      onComplete: (target) => {
        effectsRef.value?.removeChild(target)
      }
    })
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (!effectsRef.value) return

  const rect = effectsRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top

  // Создаем след только если мышь двигается достаточно быстро
  const dx = x - lastMouseX
  const dy = y - lastMouseY
  const speed = Math.sqrt(dx * dx + dy * dy)

  if (speed > 5) {
    createTrail(x, y)
  }

  lastMouseX = x
  lastMouseY = y

  // Очищаем предыдущий таймаут
  clearTimeout(mouseTrailTimeout)

  // Создаем волну при резком движении
  if (speed > 20) {
    createWave(x, y)
  }

  // Создаем энергетический след при движении
  mouseTrailTimeout = window.setTimeout(() => {
    if (Math.random() > 0.7) {
      createWave(x, y)
    }
  }, 100)
}

onMounted(() => {
  if (effectsRef.value) {
    effectsRef.value.addEventListener('click', handleClick)
    effectsRef.value.addEventListener('mousemove', handleMouseMove)
  }
})

onUnmounted(() => {
  if (effectsRef.value) {
    effectsRef.value.removeEventListener('click', handleClick)
    effectsRef.value.removeEventListener('mousemove', handleMouseMove)
  }
  clearTimeout(mouseTrailTimeout)
})
</script>

<style lang="scss" scoped>
.interactive-effects {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1000;
}

.click-ripple {
  position: absolute;
  transform: translate(-50%, -50%);
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: radial-gradient(circle at center,
    var(--color) 0%,
    transparent 70%);
  opacity: 0.5;
  animation: ripple 1s ease-out forwards;
}

.mouse-trail {
  position: absolute;
  transform: translate(-50%, -50%);
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: var(--color);
  opacity: 0.5;
  filter: blur(2px);
  animation: trail 1s ease-out forwards;
  animation-delay: var(--delay);
}

.energy-wave {
  position: absolute;
  transform: translate(-50%, -50%);
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  border: 2px solid var(--color);
  opacity: 0.5;
  animation: wave 2s ease-out forwards;
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

@keyframes trail {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
}

@keyframes wave {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}
</style> 