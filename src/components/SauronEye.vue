<template>
  <section class="sauron-eye" ref="sectionRef">
    <InteractiveEffects :colors="['#ff0000', '#ff4500', '#ff8c00', '#ffd700']" :maxRipples="4" :maxTrails="15" :maxWaves="2" />
    <canvas ref="eyeCanvas" class="eye-canvas"></canvas>
    
    <div class="eye-content" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 1000 } }">
      <div class="eye-title">
        <h2 class="fire-text" data-text="ОКО">ОКО</h2>
        <div class="eye-subtitle">ВСЕВИДЯЩЕЕ</div>
      </div>

      <div class="eye-pyramid">
        <div class="pyramid-center">
          <div class="eye-symbol">👁️</div>
          <div class="eye-rays"></div>
        </div>
        
        <div v-for="(item, index) in eyeItems" :key="index"
          class="pyramid-item"
          :style="{
            '--level': Math.floor(index / 3) + 1,
            '--position': (index % 3) + 1,
            '--delay': `${index * 0.15}s`
          }"
          @mouseenter="onItemHover(index)"
          @mouseleave="onItemLeave(index)"
          @click.stop="handleItemClick($event, index)"
        >
          <div class="item-content">
            <div class="item-header">
              <div class="item-icon">{{ item.icon }}</div>
              <div class="item-info">
                <h3 class="item-title">{{ item.title }}</h3>
              </div>
            </div>
            <div class="item-body">
              <p class="item-description">{{ item.description }}</p>
            </div>
          </div>
          <div class="item-connection"></div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import InteractiveEffects from './InteractiveEffects.vue'

const sectionRef = ref<HTMLElement | null>(null)
const eyeCanvas = ref<HTMLCanvasElement | null>(null)
let animationFrame: number
let ctx: CanvasRenderingContext2D | null = null
let time = 0

const eyeItems = [
  {
    icon: '🔥',
    title: 'ВЛАСТЬ',
    description: 'Сила огня'
  },
  {
    icon: '👁️',
    title: 'ВИДЕНИЕ',
    description: 'Всевидящее око'
  },
  {
    icon: '⚔️',
    title: 'ВОЙНА',
    description: 'Великая битва'
  },
  {
    icon: '👑',
    title: 'КОРОНА',
    description: 'Власть над всеми'
  },
  {
    icon: '💍',
    title: 'КОЛЬЦО',
    description: 'Единое кольцо'
  },
  {
    icon: '⚡',
    title: 'СИЛА',
    description: 'Древняя мощь'
  }
]

const initEye = () => {
  if (!eyeCanvas.value) return
  
  const canvas = eyeCanvas.value
  ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const draw = () => {
    if (!ctx || !canvas) return

    time += 0.01
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Рисуем глаз
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.3

    // Рисуем лучи
    for (let i = 0; i < 360; i += 5) {
      const angle = (i * Math.PI) / 180
      const radius = maxRadius * (0.8 + Math.sin(time * 2 + i * 0.1) * 0.2)
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.strokeStyle = `hsla(0, 100%, ${50 + Math.sin(time + i * 0.1) * 25}%, ${0.5 + Math.sin(time + i * 0.1) * 0.5})`
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Рисуем зрачок
    const pupilRadius = maxRadius * 0.3
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, pupilRadius
    )
    gradient.addColorStop(0, '#ff0000')
    gradient.addColorStop(1, '#800000')

    ctx.beginPath()
    ctx.arc(centerX, centerY, pupilRadius, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()

    // Добавляем блик
    ctx.beginPath()
    ctx.arc(
      centerX - pupilRadius * 0.3,
      centerY - pupilRadius * 0.3,
      pupilRadius * 0.2,
      0,
      Math.PI * 2
    )
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.fill()

    // Добавляем пульсацию
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.scale(1 + Math.sin(time * 3) * 0.1, 1 + Math.sin(time * 3) * 0.1)
    ctx.translate(-centerX, -centerY)
    ctx.restore()

    animationFrame = requestAnimationFrame(draw)
  }

  draw()
}

const onItemHover = (index: number) => {
  const item = document.querySelectorAll('.pyramid-item')[index]
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

  const connection = item.querySelector('.item-connection')
  if (connection) {
    gsap.to(connection, {
      strokeDashoffset: 0,
      duration: 0.4,
      ease: 'power2.out'
    })
  }
}

const onItemLeave = (index: number) => {
  const item = document.querySelectorAll('.pyramid-item')[index]
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

  const connection = item.querySelector('.item-connection')
  if (connection) {
    gsap.to(connection, {
      strokeDashoffset: 1000,
      duration: 0.4,
      ease: 'power2.in'
    })
  }
}

const handleItemClick = (event: MouseEvent, index: number) => {
  const target = event.currentTarget as HTMLElement
  if (!target) return
  
  const x = event.clientX
  const y = event.clientY
  const colors = ['#ff0000', '#ff4500', '#ff8c00', '#ffd700']
  const color = colors[index % colors.length]
  
  // Создаем эффект клика
  createFireEffect(x, y, color)
  
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
      boxShadow: '0 0 20px rgba(255, 0, 0, 0.2)',
      duration: 0.4,
      ease: 'elastic.out(1, 0.5)'
    })
}

const createFireEffect = (x: number, y: number, color: string = '#ff0000') => {
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
  initEye()

  window.addEventListener('resize', () => {
    if (eyeCanvas.value) {
      eyeCanvas.value.width = window.innerWidth
      eyeCanvas.value.height = window.innerHeight
    }
  })

  // Анимация появления элементов
  gsap.from('.fire-text', {
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
.sauron-eye {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(to bottom, #000000, #1a0000);
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: 
      radial-gradient(circle at 50% 50%, rgba(255, 0, 0, 0.1) 0%, transparent 50%),
      repeating-linear-gradient(
        45deg,
        rgba(255, 0, 0, 0.05) 0px,
        rgba(255, 0, 0, 0.05) 1px,
        transparent 1px,
        transparent 10px
      );
    pointer-events: none;
    z-index: 1;
  }
}

.eye-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.8;
  mix-blend-mode: screen;
  z-index: 1;
}

.eye-content {
  position: relative;
  z-index: 2;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: radial-gradient(circle at 50% 50%, rgba(255, 0, 0, 0.1) 0%, transparent 70%);
}

.eye-title {
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 200px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #ff0000, transparent);
    left: 50%;
    transform: translateX(-50%);
  }
  
  &::before {
    top: -20px;
  }
  
  &::after {
    bottom: -20px;
  }
}

.fire-text {
  font-size: clamp(3rem, 10vw, 8rem);
  font-weight: 900;
  text-transform: uppercase;
  color: #fff;
  position: relative;
  text-shadow: 
    0 0 5px #fff,
    0 0 10px #ff0000,
    0 0 20px #ff0000,
    0 0 30px #ff0000,
    0 0 40px #ff0000,
    0 0 55px #ff0000,
    0 0 70px #ff0000;
  animation: fire-pulse 2s ease-in-out infinite alternate;
  
  &::before {
    content: attr(data-text);
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    color: #ff0000;
    filter: blur(8px);
    animation: fire-pulse 2s ease-in-out infinite alternate-reverse;
  }
}

.eye-subtitle {
  font-size: clamp(1rem, 3vw, 1.5rem);
  color: #ff4500;
  opacity: 0.8;
  margin-top: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5em;
  text-shadow: 0 0 10px #ff4500;
  position: relative;
  
  &::before {
    content: '⚔️';
    position: absolute;
    left: -2em;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.8em;
    opacity: 0.5;
  }
  
  &::after {
    content: '⚔️';
    position: absolute;
    right: -2em;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.8em;
    opacity: 0.5;
  }
}

.eye-pyramid {
  position: relative;
  width: 100%;
  height: 100vh;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1000px;
  padding: 2rem;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 50%, rgba(255, 0, 0, 0.1) 0%, transparent 70%);
    filter: blur(20px);
    z-index: -1;
  }
}

.pyramid-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  margin: 2rem 0;
}

.eye-symbol {
  font-size: 4rem;
  color: #fff;
  text-shadow: 
    0 0 20px #ff0000,
    0 0 40px #ff0000,
    0 0 60px #ff0000;
  animation: eye-float 3s ease-in-out infinite alternate;
  filter: drop-shadow(0 0 10px rgba(255, 0, 0, 0.5));
}

.pyramid-item {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 280px;
  transform-origin: center;
  transform: translate(-50%, -50%);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: item-appear 0.5s ease-out forwards;
  animation-delay: var(--delay);
  opacity: 0;
  z-index: 10;
  margin: 1rem;
  
  &[style*="--level: 1"] {
    top: calc(50% - 220px);
    &[style*="--position: 1"] { 
      left: calc(50% - 300px);
      transform: translate(-50%, -50%) skew(-5deg);
    }
    &[style*="--position: 2"] { 
      left: 50%;
      transform: translate(-50%, -50%);
    }
    &[style*="--position: 3"] { 
      left: calc(50% + 300px);
      transform: translate(-50%, -50%) skew(5deg);
    }
  }
  
  &[style*="--level: 2"] {
    top: calc(50% + 160px);
    &[style*="--position: 1"] { 
      left: calc(50% - 340px);
      transform: translate(-50%, -50%) skew(-3deg);
    }
    &[style*="--position: 2"] { 
      left: calc(50% + 340px);
      transform: translate(-50%, -50%) skew(3deg);
    }
  }
}

.item-content {
  position: relative;
  background: rgba(0, 0, 0, 0.95);
  border: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 0 20px rgba(255, 0, 0, 0.2),
    0 0 40px rgba(255, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  width: 100%;
  overflow: hidden;
  margin: 0.5rem;
}

.item-header {
  position: relative;
  padding: 1.8rem;
  background: linear-gradient(90deg, 
    rgba(255, 0, 0, 0.2),
    rgba(255, 69, 0, 0.2)
  );
  display: flex;
  align-items: center;
  gap: 2rem;
  border-bottom: 2px solid rgba(255, 0, 0, 0.3);
}

.item-body {
  padding: 1.8rem;
  position: relative;
  z-index: 1;
}

.item-icon {
  font-size: 2.8rem;
  color: #ff4500;
  text-shadow: 0 0 10px rgba(255, 69, 0, 0.5);
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 0 5px rgba(255, 69, 0, 0.3));
  transform-origin: center;
  position: relative;
  margin-right: 1rem;
}

.item-info {
  flex: 1;
  text-align: left;
  position: relative;
  padding-right: 1rem;
}

.item-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ff4500;
  margin-bottom: 0.8rem;
  text-shadow: 0 0 5px rgba(255, 69, 0, 0.5);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  position: relative;
  display: inline-block;
  padding-bottom: 0.5rem;
}

.item-description {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  font-style: italic;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
  position: relative;
  padding-left: 1.8rem;
  margin-top: 0.5rem;
}

.item-connection {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 3px;
  height: 180px;
  background: linear-gradient(to top, 
    #ff0000,
    rgba(255, 0, 0, 0.5),
    transparent
  );
  transform-origin: top;
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  opacity: 0.3;
  pointer-events: none;
  margin: 1rem 0;
}

.pyramid-item:hover {
  .item-content {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 
      0 0 30px rgba(255, 0, 0, 0.4),
      0 0 60px rgba(255, 0, 0, 0.2);
    
    &::after {
      opacity: 1;
    }
  }
  
  .item-header::before {
    transform: translateX(100%);
  }
  
  .item-icon {
    transform: scale(1.2) rotate(360deg);
    filter: brightness(1.5) drop-shadow(0 0 15px rgba(255, 69, 0, 0.8));
  }
  
  .item-title::before {
    background: linear-gradient(90deg, 
      #ff4500,
      #ff8c00,
      transparent
    );
  }
  
  .item-connection {
    opacity: 0.6;
  }
}

@keyframes pulse {
  0%, 100% {
    transform: translateX(-50%) rotate(45deg) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translateX(-50%) rotate(45deg) scale(1.2);
    opacity: 0.8;
  }
}

@keyframes item-appear {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8) translateY(50px);
    filter: brightness(0.5) blur(10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) translateY(0);
    filter: brightness(1) blur(0);
  }
}

@keyframes fire-pulse {
  from {
    text-shadow: 
      0 0 5px #fff,
      0 0 10px #ff0000,
      0 0 20px #ff0000,
      0 0 30px #ff0000,
      0 0 40px #ff0000,
      0 0 55px #ff0000,
      0 0 70px #ff0000;
    filter: brightness(1);
  }
  to {
    text-shadow: 
      0 0 2.5px #fff,
      0 0 5px #ff0000,
      0 0 10px #ff0000,
      0 0 15px #ff0000,
      0 0 20px #ff0000,
      0 0 27.5px #ff0000,
      0 0 35px #ff0000;
    filter: brightness(1.2);
  }
}

@keyframes eye-float {
  from {
    transform: translateY(0) scale(1) rotate(0deg);
    filter: brightness(1) drop-shadow(0 0 10px rgba(255, 0, 0, 0.5));
  }
  to {
    transform: translateY(-20px) scale(1.2) rotate(180deg);
    filter: brightness(1.2) drop-shadow(0 0 20px rgba(255, 0, 0, 0.8));
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1400px) {
  .pyramid-item {
    width: 260px;
    
    &[style*="--level: 1"] {
      top: calc(50% - 200px);
      &[style*="--position: 1"] { left: calc(50% - 280px); }
      &[style*="--position: 2"] { left: 50%; }
      &[style*="--position: 3"] { left: calc(50% + 280px); }
    }
    
    &[style*="--level: 2"] {
      top: calc(50% + 140px);
      &[style*="--position: 1"] { left: calc(50% - 320px); }
      &[style*="--position: 2"] { left: calc(50% + 320px); }
    }
  }
  
  .item-header {
    padding: 1.5rem;
    gap: 1.5rem;
  }
  
  .item-body {
    padding: 1.5rem;
  }
  
  .item-icon {
    font-size: 2.5rem;
  }
  
  .item-title {
    font-size: 1.3rem;
  }
  
  .item-description {
    font-size: 1rem;
  }
}

@media (max-width: 1200px) {
  .pyramid-item {
    width: 240px;
    
    &[style*="--level: 1"] {
      top: calc(50% - 180px);
      &[style*="--position: 1"] { left: calc(50% - 260px); }
      &[style*="--position: 2"] { left: 50%; }
      &[style*="--position: 3"] { left: calc(50% + 260px); }
    }
    
    &[style*="--level: 2"] {
      top: calc(50% + 120px);
      &[style*="--position: 1"] { left: calc(50% - 280px); }
      &[style*="--position: 2"] { left: calc(50% + 280px); }
    }
  }
  
  .item-header {
    padding: 1.3rem;
    gap: 1.3rem;
  }
  
  .item-body {
    padding: 1.3rem;
  }
  
  .item-icon {
    font-size: 2.3rem;
  }
  
  .item-title {
    font-size: 1.2rem;
  }
  
  .item-description {
    font-size: 0.95rem;
    padding-left: 1.5rem;
  }
}

@media (max-width: 900px) {
  .pyramid-item {
    width: 220px;
    
    &[style*="--level: 1"] {
      top: calc(50% - 160px);
      &[style*="--position: 1"] { left: calc(50% - 240px); }
      &[style*="--position: 2"] { left: 50%; }
      &[style*="--position: 3"] { left: calc(50% + 240px); }
    }
    
    &[style*="--level: 2"] {
      top: calc(50% + 100px);
      &[style*="--position: 1"] { left: calc(50% - 260px); }
      &[style*="--position: 2"] { left: calc(50% + 260px); }
    }
  }
  
  .item-header {
    padding: 1.2rem;
    gap: 1.2rem;
  }
  
  .item-body {
    padding: 1.2rem;
  }
  
  .item-icon {
    font-size: 2rem;
    margin-right: 0.8rem;
  }
  
  .item-title {
    font-size: 1.1rem;
    margin-bottom: 0.6rem;
  }
  
  .item-description {
    font-size: 0.9rem;
    padding-left: 1.3rem;
    line-height: 1.5;
  }
}

@media (max-width: 600px) {
  .pyramid-item {
    width: 200px;
    
    &[style*="--level: 1"] {
      top: calc(50% - 140px);
      &[style*="--position: 1"] { left: calc(50% - 220px); }
      &[style*="--position: 2"] { left: 50%; }
      &[style*="--position: 3"] { left: calc(50% + 220px); }
    }
    
    &[style*="--level: 2"] {
      top: calc(50% + 80px);
      &[style*="--position: 1"] { left: calc(50% - 240px); }
      &[style*="--position: 2"] { left: calc(50% + 240px); }
    }
  }

  .item-header {
    padding: 1rem;
    gap: 1rem;
  }
  
  .item-body {
    padding: 1rem;
  }

  .item-icon {
    font-size: 1.8rem;
    margin-right: 0.6rem;
  }

  .item-title {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .item-description {
    font-size: 0.85rem;
    padding-left: 1.2rem;
    line-height: 1.4;
  }
  
  .item-connection {
    height: 140px;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style> 