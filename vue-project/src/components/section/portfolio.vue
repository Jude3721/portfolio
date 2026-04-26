<template>
  <div class="portfolio">
    <div class="content" id="PortfolioList">

      <p class="overline">
        <span class="overline-num">03</span>
        <span class="overline-text">Portfolio</span>
        <span class="overline-line"></span>
      </p>

      <ul v-show="isPortfolioVisible" class="project-grid fade-in">
        <li id="smartScore" @click="goToLink(erp)">
          <div class="project-img">
            <img src="../../assets/images/img/erp_img.png" alt="골프장 홈페이지" />
            <div class="project-dim">
              <span class="dim-label">VIEW →</span>
            </div>
          </div>
          <div class="project-info">
            <span class="project-num">01</span>
            <div>
              <h4 class="project-title">골프장 홈페이지</h4>
              <p class="project-meta">약 2달 · PC, MOB, ADMIN</p>
            </div>
          </div>
        </li>

        <li @click="goToLink(kbo)">
          <div class="project-img kbo-img">
            <img src="../../assets/images/img/kbo_img.svg" alt="KBO 대시보드" />
            <div class="project-dim">
              <span class="dim-label">VIEW →</span>
            </div>
          </div>
          <div class="project-info">
            <span class="project-num">02</span>
            <div>
              <h4 class="project-title">KBO 대시보드</h4>
              <p class="project-meta">개인 프로젝트 · React, Node.js</p>
            </div>
          </div>
        </li>

        <li @click="goToLink(golfstory)">
          <div class="project-img">
            <img src="../../assets/images/img/golfStory_img.png" alt="스마트스코어 앱" />
            <div class="project-dim">
              <span class="dim-label">VIEW →</span>
            </div>
          </div>
          <div class="project-info">
            <span class="project-num">03</span>
            <div>
              <h4 class="project-title">스마트스코어 앱</h4>
              <p class="project-meta">약 10일 · 웹 앱</p>
            </div>
          </div>
        </li>

        <li>
          <div class="project-img">
            <img src="../../assets/images/img/did_img.png" alt="DID 대기화면" />
            <div class="project-dim">
              <span class="dim-label">VIEW →</span>
            </div>
          </div>
          <div class="project-info">
            <span class="project-num">04</span>
            <div>
              <h4 class="project-title">DID 대기화면</h4>
              <p class="project-meta">약 4일 · UHD 해상도</p>
            </div>
          </div>
        </li>

        <li id="cndF" @click="goToLink(patagonia)">
          <div class="project-img">
            <img src="../../assets/images/img/patagonia.png" alt="파타고니아KR" />
            <div class="project-dim">
              <span class="dim-label">VIEW →</span>
            </div>
          </div>
          <div class="project-info">
            <span class="project-num">05</span>
            <div>
              <h4 class="project-title">파타고니아 KR</h4>
              <p class="project-meta">약 3개월 · 반응형 웹</p>
            </div>
          </div>
        </li>

        <li @click="goToLink(kwangdong)">
          <div class="project-img">
            <img src="../../assets/images/img/kwangdong.png" alt="광동상회" />
            <div class="project-dim">
              <span class="dim-label">VIEW →</span>
            </div>
          </div>
          <div class="project-info">
            <span class="project-num">06</span>
            <div>
              <h4 class="project-title">광동상회 웹 페이지</h4>
              <p class="project-meta">약 2개월 · 반응형 웹</p>
            </div>
          </div>
        </li>

        <li @click="goToLink(samdasoo)">
          <div class="project-img">
            <img src="../../assets/images/img/samdasoo.png" alt="제주삼다수" />
            <div class="project-dim">
              <span class="dim-label">VIEW →</span>
            </div>
          </div>
          <div class="project-info">
            <span class="project-num">07</span>
            <div>
              <h4 class="project-title">제주삼다수 웹 페이지</h4>
              <p class="project-meta">약 1개월 · 반응형 웹</p>
            </div>
          </div>
        </li>
      </ul>

      <div class="more-row" id="More">
        <button class="more-btn" @click="goToLink(moreProjeck)">
          다른 프로젝트 더보기 →
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const isPortfolioVisible = ref(false);
const erp         = 'https://faint-fox-278.notion.site/1c87bbcacd7c4ab886b60c5f9570e549';
const moreProjeck = 'https://faint-fox-278.notion.site/ad9cc50c640347e7b2085d7f295d9826';
const golfstory   = 'https://faint-fox-278.notion.site/144dcb345abc8021b713ed4294bddfdf';
const patagonia   = 'https://faint-fox-278.notion.site/d0db8940be454a0082cbeb945bd3c585';
const kwangdong   = 'https://faint-fox-278.notion.site/7efcb67ee90649adbdf6f34d46dca31e';
const samdasoo    = 'https://faint-fox-278.notion.site/28f6934d6deb4945be55774f68cb4222';
const kbo         = 'https://jude3721.github.io/portfolio/kbo-dashboard/';

const handleScroll = () => {
  const section = document.getElementById('PortfolioList');
  if (section) {
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      isPortfolioVisible.value = true;
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

const goToLink = (link) => {
  if (link && typeof window !== 'undefined') window.open(link);
};
</script>

<style scoped lang="scss">
$ed-bg: #f5f0e8;
$ed-dark: #0a0a0a;
$ed-border: rgba(0, 0, 0, 0.1);

.portfolio {
  background: $ed-bg;
  border-top: 1px solid $ed-border;
}

.content {
  width: 1200px;
  margin: 0 auto;
  padding: 120px 0 100px;

  @media (max-width: 1200px) { width: 100%; padding: 100px 6% 80px; }
}

/* ── Overline ── */
.overline {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 56px;
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

/* ── Project Grid ── */
.project-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  list-style: none;
  margin-bottom: 2px;

  @media (max-width: 900px)  { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 560px)  { grid-template-columns: 1fr; }
}

li {
  cursor: pointer;
  background: $ed-bg;
  transition: background 0.2s;

  &:hover {
    background: #ece7de;

    .project-dim { opacity: 1; }
    .project-img img { transform: scale(1.04); }
  }
}

.project-img {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.04);

  &.kbo-img { background: #0d0d1a; }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.project-dim {
  position: absolute;
  inset: 0;
  background: rgba(10, 10, 10, 0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.dim-label {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #f5f0e8;
}

.project-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 18px 20px 22px;
  border: 1px solid $ed-border;
  border-top: none;
}

.project-num {
  font-size: 11px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.25);
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
  padding-top: 2px;
  flex-shrink: 0;
}

.project-title {
  font-size: 16px;
  font-weight: 700;
  color: $ed-dark;
  letter-spacing: -0.3px;
  margin-bottom: 5px;
}

.project-meta {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.38);
  letter-spacing: 0.3px;
}

/* ── More Button ── */
.more-row {
  padding-top: 56px;
  text-align: center;
}

.more-btn {
  padding: 14px 36px;
  background: transparent;
  border: 1px solid rgba(0, 0, 0, 0.2);
  color: rgba(0, 0, 0, 0.55);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: $ed-dark;
    border-color: $ed-dark;
    color: $ed-bg;
  }
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
