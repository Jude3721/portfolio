<template>
  <div class="myinfo">
    <div class="content">
      <h3 class="fs-24 fw-700 fc-ececec pb-14 ta-c">About Me</h3>
      <div class="pb-60 bd-ececec-01 wd-800 m-0a">
        <p class="fs-18 fw-400 fc-10182b break-keep-all">
          🌟 팀워크와 협업<br/>
          팀워크를 중요하게 생각하며, 여러 팀원들과의 협업을 통해 프로젝트를 성공적으로 완수한 경험이 많습니다.<br/><br/>

          🎯 목표<br/>
          사용자에게 더 나은 웹 경험을 제공하고, 기업의 목표 달성에 기여하는 것입니다.<br/><br/>

          📈 지속적인 성장<br/>
          앞으로도 지속적으로 성장하며, 더 많은 도전을 통해 전문성을 높여 나가고 싶습니다.
        </p>
      </div>

      <h3 class="fs-24 fw-700 fc-grey600 pt-60 pb-20 ta-c">My Career</h3>
      
      <div id="Carrer">
        <div v-show="isCareerVisible" class="ps-r bg-line wd-500 m-0a pv-14 fade-in">
          <div class="dp-f align-items-center size-50 hp-40 round-r ps-r" @click="scrollTo('smartScore')">
            <h4 class="fs-20 fw-600 fc-3e4354 ml-at mr-30">스마트스코어</h4>
          </div>
          <div class="dp-f align-items-center size-50 hp-40 justify-end ml-at round-l ps-r" @click="scrollTo('cndF')">
            <h4 class="fs-20 fw-600 fc-3e4354 mr-at ml-30">CNDF</h4>
          </div>
          <div class="dp-f align-items-center size-50 hp-40 round-r ps-r" @click="scrollTo('More')">
            <h4 class="fs-20 fw-600 fc-3e4354 ml-at mr-30">바잉스퀘어<span class="fs-14">(계약직)</span></h4>
          </div>
          <div class="dp-f justify-end align-items-center size-50 hp-40 ml-at round-l ps-r" @click="scrollTo('More')">
            <h4 class="fs-20 fw-600 fc-3e4354 mr-at ml-30">머지플러스</h4>
          </div>
          <div class="dp-f align-items-center size-50 hp-40 round-r ps-r" @click="scrollTo('More')">
            <h4 class="fs-20 fw-600 fc-3e4354 ml-at mr-30">(주)지식과미래</h4>
          </div>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const  scrollTo = (targetId) => {
  const element = document.getElementById(targetId);
  if (element) {
    const top = (element.getBoundingClientRect().top - 90) + window.scrollY;
    window.scrollTo({ top, behavior: 'smooth' });
  } else {
    console.warn(`Element with id "${targetId}" not found.`);
  }
}

const isCareerVisible = ref(false);

const handleScroll = () => {
  const careerSection = document.getElementById('Carrer');

  if (careerSection) {
    if (isInViewport(careerSection)) {
      isCareerVisible.value = true;
    }
  } else {
    console.log('Career section not found');
  }
};

const isInViewport = (element) => {
  const rect = document.getElementById('Carrer').getBoundingClientRect();
  
  return (
    rect.top < window.innerHeight && 
    rect.bottom > 0 
  );
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
  .myinfo{height:fit-content; padding:100px 0; background-color:#ffffff;}

  .content{
    width:1200px;
    margin:0 auto;
  }

  .bg-line{
    &:before{
      content:'';
      position:absolute;
      left:50%; top:0;
      transform: translateX(-50%);
      width:2px; height:100%;
      background-color:#1d2f3c;
    }
  }

  .round-r{
    cursor: pointer;
    &:before{
      content:'';
      position:absolute;
      right:-8px; top:50%;
      transform: translateY(-50%);
      width:10px; height:10px;
      border:3px solid #1d2f3c;
      border-radius:10px;
      background-color:#ffffff;
    }

    &:hover{
      &:before{
        background-color:#1d2f3c;
      }
    }
  }

.round-l{
  cursor: pointer;
  &:before{
    content:'';
    position:absolute;
    left:-8px; top:50%;
    transform: translateY(-50%);
    width:10px; height:10px;
    border:3px solid #1d2f3c;
    border-radius:10px;
    background-color:#ffffff;
  }
    &:hover{
      &:before{
        background-color:#1d2f3c;
      }
    }
}
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 1.5s forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>