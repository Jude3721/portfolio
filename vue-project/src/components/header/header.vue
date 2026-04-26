<template>
  <div class="header">
    <div class="content">
      <h1 @click="top()">
        <img src="../../assets/images/img/joo.svg" alt="로고" class="logo-img" />
      </h1>
      <span class="header-label">Portfolio · 2025</span>
    </div>
  </div>
</template>

<script setup>
const top = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<style scoped lang="scss">
$ed-bg: #f5f0e8;
$ed-dark: #0a0a0a;

.header {
  position: fixed;
  left: 0; top: 0;
  width: 100%;
  padding: 18px 0;
  background: rgba(245, 240, 232, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.content {
  width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 1200px) {
    width: 100%;
    padding: 0 6%;
  }

  h1 {
    cursor: pointer;
    width: 110px;
    height: 44px;
    display: flex;
    align-items: center;
    transition: opacity 0.2s;

    &:hover { opacity: 0.5; }

    @media (max-width: 768px) {
      width: 80px;
      height: 32px;
    }
  }

  .logo-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: brightness(0);
  }
}

.header-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: rgba(0, 0, 0, 0.3);
  font-family: 'Courier New', monospace;
}
</style>
