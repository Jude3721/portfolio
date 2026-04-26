<template>
  <div class="footer">
    <div class="content">

      <div class="footer-top">
        <p class="footer-label">JDKIM · Frontend Developer</p>
        <span class="footer-year">2025</span>
      </div>

      <div class="divider"></div>

      <div class="footer-contacts">
        <a :href="`mailto:${email}`" class="contact-item">
          <span class="contact-type">Email</span>
          <span class="contact-value">ju_1021@naver.com</span>
          <span class="contact-arrow">→</span>
        </a>
        <a :href="`tel:${phone}`" class="contact-item">
          <span class="contact-type">Phone</span>
          <span class="contact-value">010.7207.3721</span>
          <span class="contact-arrow">→</span>
        </a>
      </div>

      <div class="divider"></div>

      <div class="footer-bottom">
        <span class="copyright">© 2025 JDKIM. All rights reserved.</span>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const phone = ref('010-7207-3721');
const email = ref('ju_1021@naver.com');
</script>

<style scoped lang="scss">
$ed-bg: #f5f0e8;
$ed-dark: #0a0a0a;
$ed-border: rgba(245, 240, 232, 0.1);

.footer {
  background: $ed-dark;
  padding: 80px 0 60px;
}

.content {
  width: 1200px;
  margin: 0 auto;

  @media (max-width: 1200px) { width: 100%; padding: 0 6%; }
}

/* ── Top ── */
.footer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.footer-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2.5px;
  text-transform: uppercase;
  color: rgba(245, 240, 232, 0.35);
}

.footer-year {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  color: rgba(245, 240, 232, 0.2);
  font-family: 'Courier New', monospace;
}

/* ── Divider ── */
.divider {
  height: 1px;
  background: $ed-border;
  margin-bottom: 0;
}

/* ── Contacts ── */
.footer-contacts {
  border-bottom: 1px solid $ed-border;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 0;
  border-top: 1px solid $ed-border;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    padding-left: 12px;

    .contact-arrow { opacity: 1; transform: translateX(4px); }
    .contact-value { color: $ed-bg; }
  }
}

.contact-type {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(245, 240, 232, 0.3);
  width: 60px;
  flex-shrink: 0;
}

.contact-value {
  font-size: clamp(16px, 2vw, 22px);
  font-weight: 700;
  color: rgba(245, 240, 232, 0.65);
  letter-spacing: -0.3px;
  flex: 1;
  transition: color 0.2s;
}

.contact-arrow {
  font-size: 18px;
  color: rgba(245, 240, 232, 0.3);
  opacity: 0;
  transform: translateX(0);
  transition: all 0.2s ease;
}

/* ── Bottom ── */
.footer-bottom {
  padding-top: 28px;
  text-align: right;
}

.copyright {
  font-size: 11px;
  color: rgba(245, 240, 232, 0.2);
  letter-spacing: 1px;
  font-family: 'Courier New', monospace;
}
</style>
