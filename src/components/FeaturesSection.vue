<template>
  <section class="features-section" ref="sectionRef">
    <InteractiveEffects :colors="['#00ff00', '#0000ff', '#ffff00']" :maxRipples="5" :maxTrails="20" :maxWaves="3" />
    <div class="section-background">
      <div class="gradient-sphere"></div>
      <div class="noise-overlay"></div>
    </div>

    <div
      class="section-content"
      v-motion
      :initial="{ opacity: 0 }"
      :visible="{ opacity: 1, transition: { duration: 1000 } }"
    >
      <h2 class="section-title" ref="titleRef">
        <span class="title-line">ИННОВАЦИОННЫЕ</span>
        <span class="title-line">ВОЗМОЖНОСТИ</span>
      </h2>

      <div class="features-grid">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="feature-card"
          v-motion
          :initial="{ opacity: 0, y: 50 }"
          :visible="{
            opacity: 1,
            y: 0,
            transition: {
              duration: 800,
              delay: index * 200,
            },
          }"
          @mouseenter="onCardHover(index)"
          @mouseleave="onCardLeave(index)"
          ref="cardRefs"
        >
          <div class="card-content">
            <div class="card-icon" :class="feature.icon"></div>
            <h3 class="card-title">{{ feature.title }}</h3>
            <p class="card-description">{{ feature.description }}</p>
          </div>

          <div class="card-background">
            <div class="card-gradient"></div>
            <div class="card-particles"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="floating-shapes">
      <div
        v-for="n in 10"
        :key="n"
        class="shape"
        :style="{
          '--size': `${Math.random() * 100 + 50}px`,
          '--x': `${Math.random() * 100}%`,
          '--y': `${Math.random() * 100}%`,
          '--delay': `${Math.random() * 5}s`,
          '--duration': `${Math.random() * 10 + 10}s`,
        }"
      ></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import InteractiveEffects from './InteractiveEffects.vue'

const sectionRef = ref<HTMLElement | null>(null)
const titleRef = ref<HTMLElement | null>(null)
const cardRefs = ref<(HTMLElement | null)[]>([])

const features = [
  {
    icon: 'icon-rocket',
    title: 'МОЩНЫЕ ТЕХНОЛОГИИ',
    description: 'Используйте передовые решения для производительности',
  },
  {
    icon: 'icon-brain',
    title: 'ИСКУССТВЕННЫЙ ИНТЕЛЛЕКТ',
    description: 'Инновационные алгоритмы машинного обучения',
  },
  {
    icon: 'icon-cube',
    title: '3D ВИЗУАЛИЗАЦИЯ',
    description: 'Потрясающие трехмерные эффекты и интерактивные модели',
  },
  {
    icon: 'icon-sparkles',
    title: 'УНИКАЛЬНЫЙ ДИЗАЙН',
    description: 'Современный и стильный интерфейс с анимациями',
  },
]

const onCardHover = (index: number) => {
  const card = cardRefs.value[index]
  if (!card) return

  gsap.to(card, {
    scale: 1.05,
    rotateY: 10,
    duration: 0.3,
    ease: 'power2.out',
  })

  gsap.to(card.querySelector('.card-gradient'), {
    opacity: 1,
    duration: 0.3,
  })

  gsap.to(card.querySelector('.card-particles'), {
    opacity: 1,
    scale: 1,
    duration: 0.3,
  })
}

const onCardLeave = (index: number) => {
  const card = cardRefs.value[index]
  if (!card) return

  gsap.to(card, {
    scale: 1,
    rotateY: 0,
    duration: 0.3,
  })

  gsap.to(card.querySelector('.card-gradient'), {
    opacity: 0.5,
    duration: 0.3,
  })

  gsap.to(card.querySelector('.card-particles'), {
    opacity: 0,
    scale: 0.8,
    duration: 0.3,
  })
}

onMounted(() => {
  if (titleRef.value) {
    gsap.from('.title-line', {
      duration: 1,
      y: 100,
      opacity: 0,
      stagger: 0.2,
      ease: 'power4.out',
    })
  }

  // Анимация фоновых фигур
  gsap.to('.shape', {
    y: '+=100',
    rotation: 360,
    duration: 'var(--duration)',
    delay: 'var(--delay)',
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  })
})
</script>

<style lang="scss" scoped>
.features-section {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  background: #000;
  overflow: hidden;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;

  .gradient-sphere {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 150%;
    height: 150%;
    background: radial-gradient(
      circle at center,
      rgba(255, 0, 255, 0.1) 0%,
      rgba(0, 255, 255, 0.1) 25%,
      rgba(255, 255, 0, 0.1) 50%,
      transparent 70%
    );
    filter: blur(100px);
    animation: rotate 30s linear infinite;
  }

  .noise-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    opacity: 0.1;
    mix-blend-mode: overlay;
  }
}

.section-content {
  position: relative;
  z-index: 2;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
}

.section-title {
  text-align: center;
  color: white;
  font-size: clamp(2rem, 8vw, 4rem);
  font-weight: 900;
  margin-bottom: clamp(2rem, 5vh, 4rem);
  text-transform: uppercase;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }

  .title-line {
    display: block;
    position: relative;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    line-height: 1.2;

    &::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: clamp(50px, 15vw, 100px);
      height: 4px;
      background: linear-gradient(90deg, #ff00ff, #00ffff);
      border-radius: 2px;
    }
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  box-sizing: border-box;
}

.feature-card {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: clamp(1.5rem, 4vw, 2rem);
  color: white;
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    aspect-ratio: auto;
    min-height: 250px;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    padding: 2px;
    background: linear-gradient(45deg, #ff00ff, #00ffff);
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
}

.card-content {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.card-icon {
  font-size: clamp(2rem, 5vw, 3rem);
  margin-bottom: clamp(0.5rem, 2vw, 1rem);
  background: linear-gradient(45deg, #ff00ff, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.card-title {
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  font-weight: 700;
  margin-bottom: clamp(0.5rem, 2vw, 1rem);
  text-transform: uppercase;
}

.card-description {
  font-size: clamp(0.9rem, 2.5vw, 1rem);
  line-height: 1.6;
  opacity: 0.8;
  max-width: 90%;
}

.card-background {
  position: absolute;
  inset: 0;
  border-radius: 20px;
  overflow: hidden;
  z-index: 0;

  .card-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, rgba(255, 0, 255, 0.1), rgba(0, 255, 255, 0.1));
    opacity: 0.5;
    transition: opacity 0.3s ease;
  }

  .card-particles {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(
      circle at center,
      rgba(255, 255, 255, 0.8) 0%,
      transparent 60%
    );
    opacity: 0;
    scale: 0.8;
    transition: all 0.3s ease;
  }
}

.floating-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;

  .shape {
    position: absolute;
    width: var(--size);
    height: var(--size);
    left: var(--x);
    top: var(--y);
    background: linear-gradient(45deg, #ff00ff, #00ffff);
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    opacity: 0.1;
    filter: blur(20px);
  }
}

@keyframes rotate {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

// Иконки
.icon-rocket::before {
  content: '🚀';
}
.icon-brain::before {
  content: '🧠';
}
.icon-cube::before {
  content: '🎲';
}
.icon-sparkles::before {
  content: '✨';
}

// Добавляем медиа-запросы для разных размеров экрана
@media (max-width: 480px) {
  .section-content {
    padding: 1rem;
  }

  .features-grid {
    max-width: 100%;
    padding: 0;
  }

  .section-title {
    font-size: clamp(1.8rem, 6vw, 2.5rem);
    margin-bottom: 1.5rem;
  }

  .feature-card {
    min-height: 200px;
    padding: 1.5rem;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    max-width: 800px;
    padding: 0;
  }
}

@media (min-width: 1025px) {
  .features-grid {
    grid-template-columns: repeat(4, 1fr);
    max-width: 1200px;
    padding: 0;
  }
}
</style>
