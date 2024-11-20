<template>
  <div class="footer">
    <div class="content">
      <div class="dp-f align-items-center pb-50">
        <p class="dp-f align-items-center mr-20">
          <img src="../../assets/images/img/icn_mail.svg" alt="mail icon" class="ic-color-ffffff wh-25 mr-6"/>
          <a :href="`mailto:${email}`" class="fs-18 fc-ffffff">ju_1021@naver.com</a>
        </p>
        <p class="dp-f align-items-center">
          <img src="../../assets/images/img/icn_phone.svg" alt="phone icon" class="ic-color-ffffff wh-25 mr-6"/>
          <a :href="`tel:${phone}`" class="fs-18 fc-ffffff">010.7207.3721</a>
        </p>
      </div>
      <div class="fc-ffffff fs-14 fw-400 ta-r">
        © 2024 JDKIM. All rights reserved.
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
.footer{
  width:100%;
  padding:100px 0;
  background-color:#000;

  .content{
    width:1200px;
    margin:0 auto;
  }
}

</style>