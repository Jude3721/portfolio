<template>
  <div class="section">

    <!-- 배경 비디오 + 에디토리얼 오버레이 -->
    <div class="visual">
      <div class="ed-overlay"></div>
      <div class="noise"></div>
      <video autoplay muted loop playsinline>
        <source src="../../assets/images/video/section1_vis.mp4">
      </video>
    </div>

    <!-- 히어로 콘텐츠 -->
    <div class="ed-hero">

      <p class="overline" :class="{ show: showOverline }">
        <span>Portfolio · 2025 · Frontend Developer</span>
      </p>

      <div class="title-wrap">
        <h1 class="title-line1">
          {{ displayedLine1 }}<span class="cursor" v-if="isTypingLine1">|</span>
        </h1>
        <div class="title-line2-wrap" :class="{ show: showLine2 }">
          <h1 class="title-line2">PORTFOLIO</h1>
        </div>
      </div>

      <div class="hero-bottom" :class="{ show: showBottom }">
        <div class="divider-line"></div>
        <div class="bottom-row">
          <p class="bottom-desc">사용자 경험을 설계하고 구현합니다</p>
          <div class="bottom-right">
            <span class="bottom-year">© 2025</span>
            <a class="ed-cta" @click.prevent="scrollToPortfolio">VIEW PORTFOLIO →</a>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const fullLine1 = "JD KIM";
const displayedLine1 = ref("");
const isTypingLine1 = ref(true);
const showLine2 = ref(false);
const showOverline = ref(false);
const showBottom = ref(false);
let idx = 0;

const typeL1 = () => {
  if (idx < fullLine1.length) {
    displayedLine1.value += fullLine1.charAt(idx++);
    setTimeout(typeL1, 120);
  } else {
    isTypingLine1.value = false;
    setTimeout(() => { showLine2.value = true; }, 200);
    setTimeout(() => { showBottom.value = true; }, 750);
  }
};

onMounted(() => {
  setTimeout(() => { showOverline.value = true; }, 400);
  setTimeout(typeL1, 900);
});

const scrollToPortfolio = () => {
  document.querySelector('.portfolio')?.scrollIntoView({ behavior: 'smooth' });
};
</script>

<style scoped lang="scss">
$ed-bg: #f5f0e8;
$ed-dark: #0a0a0a;

.section {
  position: relative;
  height: 100vh;
  overflow: hidden;
  background: $ed-bg;
}

/* ── 배경 ── */
.visual {
  position: absolute;
  inset: 0;

  .ed-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    background: rgba(245, 240, 232, 0.88);
  }

  .noise {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
    background-size: 200px 200px;
    opacity: 0.5;
  }

  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

/* ── 히어로 레이아웃 ── */
.ed-hero {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 8% 10% 8%;

  @media (max-width: 1200px) { padding: 0 6% 14% 6%; }
  @media (max-width: 768px)  { padding: 0 6% 20% 6%; }
}

/* ── Overline ── */
.overline {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.38);
  margin-bottom: 28px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.7s ease, transform 0.7s ease;

  &.show { opacity: 1; transform: translateY(0); }

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(0, 0, 0, 0.14);
  }
}

/* ── 타이틀 ── */
.title-wrap {
  display: flex;
  flex-direction: column;
  margin-bottom: 44px;
}

.title-line1 {
  font-size: clamp(52px, 8vw, 108px);
  font-weight: 900;
  letter-spacing: -4px;
  line-height: 0.92;
  color: $ed-dark;
  margin: 0;
  font-family: 'Spoqa Han Sans Neo', 'Noto Sans KR', system-ui;
}

.title-line2-wrap {
  overflow: hidden;

  .title-line2 {
    font-size: clamp(52px, 8vw, 108px);
    font-weight: 900;
    letter-spacing: -4px;
    line-height: 0.92;
    color: transparent;
    -webkit-text-stroke: 1.5px rgba(0, 0, 0, 0.28);
    margin: 0;
    font-family: 'Spoqa Han Sans Neo', 'Noto Sans KR', system-ui;
    transform: translateY(32px);
    opacity: 0;
    transition: transform 0.75s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.75s ease;
  }

  &.show .title-line2 {
    transform: translateY(0);
    opacity: 1;
  }
}

.cursor {
  color: $ed-dark;
  font-weight: 200;
  animation: blink 0.75s step-end infinite;
}
@keyframes blink { 50% { opacity: 0; } }

/* ── 하단 바 ── */
.hero-bottom {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s;

  &.show { opacity: 1; transform: translateY(0); }
}

.divider-line {
  width: 100%;
  height: 1px;
  background: rgba(0, 0, 0, 0.14);
  margin-bottom: 20px;
}

.bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.bottom-desc {
  font-size: clamp(13px, 1.2vw, 15px);
  color: rgba(0, 0, 0, 0.42);
  letter-spacing: 0.3px;
}

.bottom-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.bottom-year {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  color: rgba(0, 0, 0, 0.28);
  font-family: 'Courier New', monospace;
}

.ed-cta {
  padding: 12px 28px;
  background: $ed-dark;
  color: $ed-bg;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  border-radius: 3px;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: inline-block;

  &:hover {
    background: #333;
    transform: translateX(3px);
  }
}
</style>
