<template>
  <div class="portfolio">
    <div class="content" id="PortfolioList">
        <ul v-show="isPortfolioVisible" class="fade-in">
          <li id="smartScore" class="dp-f gap-30 pv-30" @click="goToLink(erp)">
            <div class="image_box">
              <img src="../../assets/images/img/erp_img.png" alt="" />
              
              <div class="dim">
                <button class="btn_com">자세히 보기</button>
              </div>
            </div>
            <div class="dp-f flex-column text-box">
              <h4 class="title">골프장 홈페이지</h4>
              <!-- <p class="text">
                역할: 퍼블리셔<br/>
                기술 스택: html, scss, javascript, Nuxt.js<br/>
                PC, 모바일, 어드민 작업<br/>
                디자인의 세 가지 타입에 맞춰 퍼블리싱을 진행하며, 컴포넌트화와 모듈화를 중점적으로 고려하였습니다.<br/>
                이를 통해 코드의 재사용성을 높이고, 유지보수를 용이하게 하는 데 기여하였습니다.
              </p>
              <button class="btn_com mt-at ml-at" @click="goToLink(erp)">자세히 보기</button> -->
            </div>
          </li>
          <li class="dp-f gap-30 pv-30" @click="goToLink(golfstory)">
            <div class="image_box">
              <img src="../../assets/images/img/golfStory_img.png" alt="" />
              <div class="dim">
                <button class="btn_com">자세히 보기</button>
              </div>
            </div>
            <div class="dp-f flex-column text-box">
              <h4 class="title">스마트스코어 앱(골프 스토리)</h4>
              <!-- <p class="text">
                역할: 퍼블리셔<br/>
                기술 스택: html, scss, javascript, vue.js<br/>
                웹 앱 프로젝트에서 모바일 디바이스 환경에 중점을 두고 작업해왔습니다.<br/>
                사용자 경험을 최우선으로 고려하여 다양한 화면 크기와 해상도에 최적화 되게 구현하였습니다.<br/>
                모바일 환경에서의 성능 최적화와 접근성 향상에 집중하여, 사용자들이 어디서든 편리하게 앱을 이용할 수 있도록 했습니다.
              </p>
              <button class="btn_com mt-at ml-at">자세히 보기</button> -->
            </div>
          </li>
          <li class="dp-f gap-30 pv-30">
            <div class="image_box">
              <img src="../../assets/images/img/did_img.png" alt="" />
              <div class="dim">
                <button class="btn_com">자세히 보기</button>
              </div>
            </div>
            <div class="dp-f flex-column text-box">
              <h4 class="title">DID 대기화면</h4>
              <!-- <p class="text">
                역할: 퍼블리셔<br/>
                기술 스택: html, scss, javascript, vue.js<br/>
                UHD 해상도까지 지원하는 작업을 진행하며, 모든 디바이스에서 동일한 사용자 환경을 구현하는 데 중점을 두었습니다.<br/>
                다양한 화면 크기와 해상도에 최적화된 반응형 코드를 적용하여, 사용자 경험을 극대화하기 위해 노력했습니다.<br/>
                특히, 고해상도 디스플레이에서도 선명하고 일관된 UI를 제공하기 위해 CSS와 JavaScript를 활용하여 세밀한 조정을 하였습니다. <br/>
              </p>
              <button class="btn_com mt-at ml-at">자세히 보기</button> -->
            </div>
          </li>
          <li class="dp-f gap-30 pv-30" id="cndF">
            <div class="image_box">
              <img src="../../assets/images/img/golfStory_img.png" alt="" />
              <div class="dim">
                <button class="btn_com">자세히 보기</button>
              </div>
            </div>
            <div class="dp-f flex-column text-box">
              <h4 class="title">파타고니아KR</h4>
              <!-- <p class="text">
                역할: 퍼블리셔 및 PM<br/>
                기술 스택: html, scss, javascript, jQuery<br/>
                KR 사이트 리뉴얼 프로젝트<br/>
                총 4명의 퍼블리셔와 협업으로 진행<br/>
                선임자로서 프로젝트 관리, 기술 지원, 코드 리뷰 등의 역할을 맡아 팀원들과 원활하게 소통하며 프로젝트를 성공적으로 이끌었습니다.<br/>
                해당 프로젝트 진행 시에는 프론트 앤드 작업 또한 같이 진행하였습니다.
              </p>
              <button class="btn_com mt-at ml-at">자세히 보기</button> -->
            </div>
          </li>
          <li class="dp-f gap-30 pv-30">
            <div class="image_box">
              <img src="../../assets/images/img/did_img.png" alt="" />
              <div class="dim">
                <button class="btn_com">자세히 보기</button>
              </div>
            </div>
            <div class="dp-f flex-column text-box">
              <h4 class="title">광동상회 웹 페이지</h4>
              <!-- <p class="text">
                역할: 퍼블리셔 및 PM<br/>
                기술 스택: html, scss, javascript, jQuery<br/>
                모바일 최적화 페이지 작업을 수행하며, 총 3명의 퍼블리셔 팀의 선임 역할을 맡아 진행했습니다.<br/>
                이 프로젝트에서는 퍼블리셔로서의 역할보다 프론트엔드 작업에 중점을 두고, 사용자 경험을 극대화하기 위해 노력했습니다.<br/>
                특히, 다양한 모바일 디바이스에서 최적의 성능을 발휘할 수 있도록 반응형 디자인을 적용하고, CSS 및 JavaScript를 활용하여 인터페이스의 세부 조정을 진행했습니다.
              </p>
              <button class="btn_com mt-at ml-at">자세히 보기</button> -->
            </div>
          </li>
          <li class="dp-f gap-30 pv-30">
            <div class="image_box">
              <img src="../../assets/images/img/golfStory_img.png" alt="" />
              <div class="dim">
                <button class="btn_com">자세히 보기</button>
              </div>
            </div>
            <div class="dp-f flex-column text-box">
              <h4 class="title">제주삼다수 웹 페이지</h4>
              <!-- <p class="text">
                역할: 퍼블리셔 및 PM<br/>
                기술 스택: html, scss, javascript, jQuery<br/>
                이 프로젝트에서는 퍼블리셔의 역할보다 프로젝트 매니저(PM) 역할에 중점을 두었습니다.<br/>
                팀의 원활한 협업과 프로젝트 진행 관리를 이끌어냈습니다.<br/>
                프로젝트의 전반적인 일정 조율, 자원 배분, 그리고 팀원 간의 소통을 강화하여 효율적인 작업 환경을 조성했습니다.<br/>
                모바일 최적화에 있어서는 사용자 경험을 극대화하기 위해 디자인과 개발 간의 조율을 통해 반응형 페이지를 성공적으로 구현했습니다.
              </p>
              <button class="btn_com mt-at ml-at">자세히 보기</button> -->
            </div>
          </li>
          <li class="size-100 ta-c pt-150" id="More">
            <button class="btn_com" @click="goToLink(moreProjeck)">다른 프로젝트 더보기</button>
          </li>
        </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const isPortfolioVisible = ref(false);
const erp = 'https://faint-fox-278.notion.site/1c87bbcacd7c4ab886b60c5f9570e549';
const moreProjeck = 'https://faint-fox-278.notion.site/ad9cc50c640347e7b2085d7f295d9826';
const golfstory = 'https://faint-fox-278.notion.site/144dcb345abc8021b713ed4294bddfdf';

const handleScroll = () => {
  const careerSection = document.getElementById('PortfolioList');

  if (careerSection) {
    if (isInViewport(careerSection)) {
      isPortfolioVisible.value = true;
    }
  } else {
    console.log('PortfolioList section not found');
  }
};

const isInViewport = (element) => {
  const rect = document.getElementById('PortfolioList').getBoundingClientRect();
  
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

const goToLink = (link) =>{
  if (typeof window !== "undefined") {
    window.open(link);
  }
}


</script>

<style scoped lang="scss">
.content{
  width:1000px;
  margin:0 auto;
  padding:120px 0;

  @media all and (max-width:1000px){
    width:100%;
  }
  
  ul{
    display:flex;
    flex-direction: row;
    flex-wrap:wrap;
    justify-content: space-between;
    width:100%;

    @media all and (max-width:1000px){
      justify-content: center;
    }
    @media all and (max-width:600px){
      width:90%;
    }
    
    li{
      flex-direction: column;
      width:fit-content;
      text-align:center;
      cursor:pointer;

      &#More{cursor:auto;} 
      
      &:hover{
        .image_box{
          .dim{
            display:flex;
          }
        }
        }
    
      .image_box{
        position:relative;
        width:100%; max-width:420px;
        aspect-ratio: 1;
        border-radius:20px;
        overflow: hidden;
        margin:0 auto;
        @media all and (max-width:1000px){
          max-width:100%;
        }

        .dim{
          position:absolute;
          left:0; top:0;
          width:100%; height:100%;
          background-color:rgba(0,0,0,0.7);
          backdrop-filter:blur(10px);
          display:none;
          justify-content: center;
          align-items: center;
          
          .btn_com{
            border:1px solid #fff;
            color:#fff;

            &:hover{
              background-color:rgba(255,255,255,0.6);

            }
          }
        }

        img{
          width:100%; height:100%;
        }
      }

      .text-box{
        width:100%;
        .title{
          margin-bottom:16px;
          font-size:24px;
        }

        .text{
          font-size:17px;
          line-height: 22px;
          word-break: keep-all;
        }
      }

    }
  }
}

.btn_com{
  min-width:120px;
  padding:12px 20px;
  border:1px solid #10182b;
  border-radius:8px;
  text-align:center;

  &:hover{
    color:#ffffff;
    background-color:#10182b;

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