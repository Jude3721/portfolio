<template>
  <div class="section">
    <div class="typewriter">
      <p id="typewriter-text" class="dp-f fc-ffffff fs-60 fw-700">
        {{ displayedText }}
      </p>
      <span class="caret" v-if="isTyping"></span>
    </div>
    <div class="visual bg-10182b">
      <div class="dim"></div>
      <video autoplay muted loop>
        <source src="../../assets/images/video/section1_vis.mp4">
      </video>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const fullText = "JD KIM PORTFOLIO";
const displayedText = ref("");
const index = ref(0);
const isTyping = ref(true);

const type = () => {
  if (index.value < fullText.length) {
    displayedText.value += fullText.charAt(index.value);
    index.value++;
    setTimeout(type, 100); // 각 글자 사이의 시간 (100ms)
  } else {
    isTyping.value = false; // 타이핑이 끝나면 커서 제거
  }
};

onMounted(() => {
  type(); // 컴포넌트가 마운트되면 타이핑 시작
});
</script>

<style scoped lang="scss">
.section{height:100vh;}
.visual{
  position:relative;
  width:100%; height:100%;
  overflow: hidden;

  .dim{
    position: absolute;
    left:0;top:0;
    background-color:rgba(0,0,0,0.6);
    width:100%; height:100%;
  }
  video{
    width:100%;
  }

}

.typewriter {
    position:absolute;
    left:20%; bottom:20%;
    display: inline-block;
    width: auto;
    overflow: hidden;
    border-right: 0.1em solid #ffffff;
    white-space: nowrap;
    z-index:10;

    p {
      width:fit-content;
      font-size: 2rem;
      margin: 0;

      @media all and (max-width:1200px){
        font-size:5vw !important;
      }
    }
}

.caret {
  display: inline; /* 커서가 텍스트와 함께 보이도록 */
  animation: blink-caret 0.75s step-end infinite; /* 깜빡이는 애니메이션 */
}

@keyframes blink-caret {
  50% {
    border-color: transparent; /* 커서 깜빡임 효과 */
  }
}

</style>