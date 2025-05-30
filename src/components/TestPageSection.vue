<template>
  <section class="test-page-section">
    <div class="background-layer">
      <div class="static-gradient"></div>
      <div class="noise-overlay"></div>
      <div class="animated-glow"></div>
    </div>
    
    <div class="content-layer">
      <div class="content" v-motion-slide-bottom>
        <div class="typewriter-container">
          <h2 class="typewriter-title">ЭТО ТЕСТОВАЯ СТРАНИЦА</h2>
          <div class="typewriter-text">
            <pre class="text-content">{{ currentText }}<span class="cursor" v-if="isTyping">|</span></pre>
          </div>
        </div>

        <div class="effects-showcase">
          <TransitionGroup name="effect-fade">
            <div 
              v-for="(effect, index) in visibleEffects" 
              :key="effect.id"
              class="effect-item"
              :class="{ 'exploding': explodingEffect === effect.id }"
              @click="handleEffectClick(effect)"
            >
              <div class="effect-icon">{{ effect.icon }}</div>
              <div class="effect-name">{{ effect.name }}</div>
              <Teleport to="body">
                <div class="explosion-particles" v-if="explodingEffect === effect.id">
                  <div v-for="n in 36" :key="n" class="particle" :style="{
                    '--angle': `${n * 10}deg`,
                    '--distance': `${80 + Math.random() * 120}px`,
                    '--delay': `${n * 0.01}s`,
                    '--size': `${3 + Math.random() * 8}px`,
                    '--color': `hsl(${n * 10}, 100%, ${50 + Math.random() * 30}%)`,
                    '--duration': `${0.8 + Math.random() * 0.4}s`
                  }"></div>
                </div>
                <div class="explosion-wave" v-if="explodingEffect === effect.id"></div>
              </Teleport>
            </div>
          </TransitionGroup>
        </div>

        <div class="disclaimer" v-motion-fade-visible>
          <p>Это просто демонстрация различных эффектов и анимаций.</p>
          <p>Не воспринимайте это всерьёз 😉</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'

const typewriterLines = [
  'Собрание различных эффектов и анимаций.',
  'Эксперимент с современными веб-технологиями.',
  'Просто для развлечения и демонстрации.',
  'Надеюсь, вам понравилось!'
]

const effects = ref([
  { icon: '🎨', name: 'Градиенты', id: 'gradients' },
  { icon: '✨', name: 'Свечение', id: 'glow' },
  { icon: '🌀', name: 'Анимации', id: 'animations' },
  { icon: '🎭', name: 'Эффекты', id: 'effects' },
  { icon: '🎮', name: 'Интерактив', id: 'interactive' },
  { icon: '🎪', name: 'Порталы', id: 'portals' },
  { icon: '🌌', name: 'Космос', id: 'cosmos' },
  { icon: '⚡', name: 'Энергия', id: 'energy' }
])

const currentText = ref('')
const currentLineIndex = ref(0)
const currentCharIndex = ref(0)
const isTyping = ref(false)
const effectsVisible = ref(false)
const explodingEffect = ref<string | null>(null)
const clickedEffects = ref<Set<string>>(new Set())
const pendingEffects = ref<Map<string, { effect: typeof effects.value[0], timeout: number }>>(new Map())

const visibleEffects = computed(() => {
  return effectsVisible.value ? effects.value : []
})

const typeText = () => {
  if (currentLineIndex.value >= typewriterLines.length) {
    return
  }

  const currentLine = typewriterLines[currentLineIndex.value]
  
  if (currentCharIndex.value < currentLine.length) {
    currentText.value += currentLine[currentCharIndex.value]
    currentCharIndex.value++
    setTimeout(typeText, 50)
  } else {
    currentText.value += '\n'
    currentLineIndex.value++
    currentCharIndex.value = 0
    setTimeout(typeText, 500)
  }
}

const clearTimeouts = () => {
  // Очищаем все таймеры из pendingEffects
  pendingEffects.value.forEach(({ timeout }) => {
    clearTimeout(timeout)
  })
  pendingEffects.value.clear()
}

const handleEffectClick = (effect: { name: string, icon: string, id: string }) => {
  // Если кнопка уже взрывается или была взорвана, игнорируем клик
  if (clickedEffects.value.has(effect.id)) return

  // Начинаем новый взрыв
  explodingEffect.value = effect.id
  clickedEffects.value.add(effect.id)
  
  // Удаляем эффект из видимых после завершения анимации взрыва
  const explosionTimeout = window.setTimeout(() => {
    const index = effects.value.findIndex(e => e.id === effect.id)
    if (index !== -1) {
      effects.value.splice(index, 1)
    }
  }, 800)

  // Добавляем эффект в очередь на возврат
  const returnTimeout = window.setTimeout(() => {
    effects.value.push(effect)
    explodingEffect.value = null
    clickedEffects.value.delete(effect.id)
    pendingEffects.value.delete(effect.id)
  }, 1500)

  // Сохраняем таймер в Map
  pendingEffects.value.set(effect.id, { effect, timeout: returnTimeout })
}

onMounted(() => {
  setTimeout(() => {
    isTyping.value = true
    typeText()
  }, 1000)

  setTimeout(() => {
    effectsVisible.value = true
  }, 1500)
})

onUnmounted(() => {
  clearTimeouts()
})
</script>

<style lang="scss" scoped>
.test-page-section {
  min-height: 100vh;
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  overflow: hidden;
  background: #000;
}

.background-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
  isolation: isolate;
  overflow: hidden;
}

.static-gradient {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(255, 0, 255, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(0, 255, 255, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(255, 255, 0, 0.03) 0%, transparent 50%);
  filter: blur(100px);
  transform: translateZ(0);
  animation: gradient-shift 30s ease-in-out infinite alternate;
}

.noise-overlay {
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  opacity: 0.02;
  mix-blend-mode: overlay;
  transform: translateZ(0);
  animation: noise-shift 20s ease-in-out infinite alternate;
}

.animated-glow {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at var(--x, 50%) var(--y, 50%), 
      rgba(255, 0, 255, 0.05) 0%,
      rgba(0, 255, 255, 0.05) 25%,
      rgba(255, 255, 0, 0.05) 50%,
      transparent 70%);
  filter: blur(80px);
  transform: translateZ(0);
  animation: glow-move 15s ease-in-out infinite alternate;
}

.content-layer {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  text-align: center;
  padding: 2rem;
  margin: 0 auto;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 
    0 0 20px rgba(255, 0, 255, 0.2),
    0 0 40px rgba(0, 255, 255, 0.2);
  transform: translateZ(0);
}

.typewriter-container {
  margin-bottom: 3rem;
}

.typewriter-title {
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 900;
  margin-bottom: 2rem;
  background: linear-gradient(45deg, #ff00ff, #00ffff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 
    0 0 10px rgba(255, 0, 255, 0.5),
    0 0 20px rgba(0, 255, 255, 0.5);
}

.typewriter-text {
  font-size: clamp(1rem, 2vw, 1.5rem);
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  text-align: left;
  margin: 0 auto;
  max-width: 600px;
  min-height: 200px;
}

.text-content {
  font-family: inherit;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
  padding: 0;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: #00ffff;
  margin-left: 2px;
  animation: blink 1s infinite;
  vertical-align: middle;
}

.effects-showcase {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1.5rem;
  margin: 3rem 0;
  width: 100%;
  min-height: 200px;
}

.effect-item {
  position: relative;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  opacity: 0;
  transform: translateY(20px);
  animation: effect-appear 0.5s ease forwards;
  animation-delay: var(--delay);
  overflow: visible;

  &.exploding {
    animation: explode 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    pointer-events: none;
    z-index: 100;
    will-change: transform, opacity, filter;
  }

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 0 20px rgba(255, 0, 255, 0.2),
      0 0 40px rgba(0, 255, 255, 0.2);
  }
}

.effect-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  transition: transform 0.3s ease;

  .effect-item:hover & {
    transform: scale(1.2);
  }
}

.effect-name {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  text-align: center;
}

.explosion-particles {
  position: fixed;
  left: 50%;
  top: 50%;
  width: 200vw;
  height: 200vh;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 200;
}

.particle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: var(--size, 4px);
  height: var(--size, 4px);
  background: var(--color, #ff00ff);
  border-radius: 50%;
  box-shadow: 
    0 0 10px var(--color, #ff00ff),
    0 0 20px var(--color, #ff00ff);
  animation: particle-explode 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  opacity: 0;
}

.explosion-wave {
  position: fixed;
  left: 50%;
  top: 50%;
  width: 200vw;
  height: 200vh;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, 
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0.4) 20%,
    rgba(255, 255, 255, 0) 70%
  );
  transform: translate(-50%, -50%) scale(0);
  animation: wave-explode 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  z-index: 150;
  mix-blend-mode: screen;
}

.disclaimer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
  line-height: 1.6;

  p {
    margin-bottom: 0.5rem;
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes gradient-shift {
  0% {
    transform: scale(1) translateZ(0);
  }
  100% {
    transform: scale(1.2) translateZ(0);
  }
}

@keyframes noise-shift {
  0% {
    transform: translate(0, 0) translateZ(0);
  }
  100% {
    transform: translate(1%, 1%) translateZ(0);
  }
}

@keyframes glow-move {
  0% {
    --x: 20%;
    --y: 20%;
    opacity: 0.5;
  }
  50% {
    --x: 80%;
    --y: 50%;
    opacity: 0.7;
  }
  100% {
    --x: 50%;
    --y: 80%;
    opacity: 0.5;
  }
}

@keyframes effect-appear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes explode {
  0% {
    transform: scale(1) translate(0, 0);
    opacity: 1;
    filter: brightness(1) blur(0);
  }
  15% {
    transform: scale(1.2) translate(-3px, -3px);
    filter: brightness(2) blur(2px);
  }
  30% {
    transform: scale(1.3) translate(3px, 3px);
    filter: brightness(2.5) blur(3px);
  }
  45% {
    transform: scale(1.4) translate(-2px, 2px);
    filter: brightness(3) blur(4px);
  }
  60% {
    transform: scale(1.2) translate(2px, -2px);
    filter: brightness(2) blur(2px);
  }
  100% {
    transform: scale(0) translate(0, 0);
    opacity: 0;
    filter: brightness(0) blur(10px);
  }
}

@keyframes particle-explode {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: 
      translate(
        calc(-50% + cos(var(--angle)) * var(--distance)),
        calc(-50% + sin(var(--angle)) * var(--distance))
      )
      scale(0);
    opacity: 0;
  }
}

@keyframes wave-explode {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0;
  }
}

.effect-fade-enter-active,
.effect-fade-leave-active {
  transition: all 0.5s ease;
}

.effect-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.effect-fade-leave-to {
  opacity: 0;
  transform: scale(0);
}

@media (max-width: 768px) {
  .content {
    padding: 1.5rem;
  }

  .effects-showcase {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}
</style> 