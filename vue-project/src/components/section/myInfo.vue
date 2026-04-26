<template>
  <div class="myInfo">
    <div class="content">

      <!-- About Me -->
      <div class="section-block">
        <p class="overline">
          <span class="overline-num">01</span>
          <span class="overline-text">About Me</span>
          <span class="overline-line"></span>
        </p>

        <div class="about-grid">
          <div class="about-item">
            <p class="about-label">팀워크와 협업</p>
            <p class="about-text">
              팀워크를 중요하게 생각하며, 여러 팀원들과의 협업을 통해
              프로젝트를 성공적으로 완수한 경험이 많습니다.
            </p>
          </div>
          <div class="about-item">
            <p class="about-label">목표</p>
            <p class="about-text">
              사용자에게 더 나은 웹 경험을 제공하고,
              기업의 목표 달성에 기여하는 것입니다.
            </p>
          </div>
          <div class="about-item">
            <p class="about-label">지속적인 성장</p>
            <p class="about-text">
              앞으로도 지속적으로 성장하며, 더 많은 도전을 통해
              전문성을 높여 나가고 싶습니다.
            </p>
          </div>
        </div>
      </div>

      <!-- My Career -->
      <div class="section-block" id="Carrer">
        <p class="overline">
          <span class="overline-num">02</span>
          <span class="overline-text">My Career</span>
          <span class="overline-line"></span>
        </p>

        <div v-show="isCareerVisible" class="career-list fade-in">
          <div class="career-row" @click="scrollTo('smartScore')">
            <span class="career-name">스마트스코어</span>
            <span class="career-arrow">→</span>
          </div>
          <div class="career-row" @click="scrollTo('cndF')">
            <span class="career-name">CNDF</span>
            <span class="career-arrow">→</span>
          </div>
          <div class="career-row" @click="scrollTo('More')">
            <span class="career-name">
              바잉스퀘어
              <span class="career-badge">계약직</span>
            </span>
            <span class="career-arrow">→</span>
          </div>
          <div class="career-row" @click="scrollTo('More')">
            <span class="career-name">머지플러스</span>
            <span class="career-arrow">→</span>
          </div>
          <div class="career-row" @click="scrollTo('More')">
            <span class="career-name">(주)지식과미래</span>
            <span class="career-arrow">→</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const scrollTo = (targetId: string) => {
  const element = document.getElementById(targetId);
  if (element) {
    const top = (element.getBoundingClientRect().top - 90) + window.scrollY;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};

const isCareerVisible = ref(false);

const handleScroll = () => {
  const careerSection = document.getElementById('Carrer');
  if (careerSection) {
    const rect = careerSection.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      isCareerVisible.value = true;
    }
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll();
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped lang="scss">
$ed-bg: #f5f0e8;
$ed-dark: #0a0a0a;
$ed-border: rgba(0, 0, 0, 0.1);

.myInfo {
  background: $ed-bg;
  padding: 120px 0;
}

.content {
  width: 1200px;
  margin: 0 auto;

  @media (max-width: 1200px) { width: 100%; padding: 0 6%; }
}

/* ── 섹션 블록 ── */
.section-block {
  margin-bottom: 80px;

  &:last-child { margin-bottom: 0; }
}

/* ── Overline ── */
.overline {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 48px;
}

.overline-num {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  color: rgba(0, 0, 0, 0.3);
  font-family: 'Courier New', monospace;
}

.overline-text {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.4);
}

.overline-line {
  flex: 1;
  height: 1px;
  background: $ed-border;
}

/* ── About Grid ── */
.about-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.about-item {
  padding: 32px 40px 32px 0;
  border-right: 1px solid $ed-border;

  &:last-child {
    border-right: none;
    padding-right: 0;
    padding-left: 40px;

    @media (max-width: 768px) { padding-left: 0; }
  }

  &:nth-child(2) {
    padding-left: 40px;

    @media (max-width: 768px) { padding-left: 0; }
  }

  @media (max-width: 768px) {
    padding: 28px 0;
    border-right: none;
    border-bottom: 1px solid $ed-border;

    &:last-child { border-bottom: none; }
  }
}

.about-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.35);
  margin-bottom: 14px;
}

.about-text {
  font-size: 15px;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.75;
  word-break: keep-all;
}

/* ── Career List ── */
.career-list {
  border-top: 1px solid $ed-border;
}

.career-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 0;
  border-bottom: 1px solid $ed-border;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    padding-left: 12px;

    .career-arrow { opacity: 1; transform: translateX(4px); }
    .career-name  { color: $ed-dark; }
  }
}

.career-name {
  font-size: clamp(18px, 2vw, 24px);
  font-weight: 700;
  color: rgba(0, 0, 0, 0.65);
  letter-spacing: -0.5px;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.career-badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(0, 0, 0, 0.18);
  padding: 3px 8px;
  border-radius: 3px;
}

.career-arrow {
  font-size: 18px;
  color: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transform: translateX(0);
  transition: all 0.2s ease;
}

/* ── Fade In ── */
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 1s forwards;
}

@keyframes fadeIn {
  to { opacity: 1; transform: translateY(0); }
}
</style>
