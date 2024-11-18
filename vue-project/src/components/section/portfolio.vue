<template>
  <div class="portfolio">
    <div class="content">
        <ul class="dp-f flex-column">
          <li id="smartScore" class="dp-f gap-30 pv-30">
            <div class="image_box">
              <img src="../../assets/images/img/erp_img.png" alt="" />
            </div>
            <div class="dp-f flex-column text-box">
              <h4 class="title">골프장 홈페이지</h4>
              <p class="text">
                NUXT.js 환경 프로젝트로 PC, MOB 타입 분리형 구조로 작업<br/>
                3개의 디자인 타입과 어드민 페이지 작업<br/>
                작업 기간 : 각 타입 별 1개월<br/>
                퍼블리셔 기여도 : 100%
              </p>
              <button class="btn_com mt-at ml-at">자세히 보기</button>
            </div>
          </li>
          <li class="dp-f gap-30 pv-30">
            <div class="dp-f flex-column text-box">
              <h4 class="title">스마트스코어 앱(골프 스토리)</h4>
              <p class="text">
                VUE.js 환경 프로젝트로 웹 앱 작업<br/>
                작업 기간 : 1개월<br/>
                퍼블리셔 기여도 : 100%
              </p>
              <button class="btn_com mt-at ml-at">자세히 보기</button>
            </div>
            <div class="image_box">
              <img src="../../assets/images/img/golfStory_img.png" alt="" />
            </div>
          </li>
          <li class="dp-f gap-30 pv-30">
            <div class="image_box">
              <img src="../../assets/images/img/did_img.png" alt="" />
            </div>
            <div class="dp-f flex-column text-box">
              <h4 class="title">DID 대기화면</h4>
              <p class="text">
                UHD 해상도 화면까지 고려한 반응형 작업<br/>
                작업 기간 : 2주<br/>
                퍼블리셔 기여도 : 100%
              </p>
              <button class="btn_com mt-at ml-at">자세히 보기</button>
            </div>
          </li>
          <li class="dp-f gap-30 pv-30" id="cndF">
            <div class="dp-f flex-column text-box">
              <h4 class="title">파타고니아KR</h4>
              <p class="text">
                역할: 퍼블리싱
                기술 스택: html, scss, javascript, jQuery
                성과: KR 사이트 리뉴얼 프로젝트
                총 4명의 퍼블리셔와 협업으로 진행하였으며, 선임자로서 프로젝트 관리, 기술 지원, 코드 리뷰 등의 역할을 맡아 팀원들과 원활하게 소통하며 프로젝트를 성공적으로 이끌었습니다.
                해당 프로젝트 진행 시에는 프론트 앤드 작업 또한 같이 진행하였습니다.
              </p>
              <button class="btn_com mt-at ml-at">자세히 보기</button>
            </div>
            <div class="image_box">
              <img src="../../assets/images/img/golfStory_img.png" alt="" />
            </div>
          </li>
          <li class="dp-f gap-30 pv-30">
            <div class="image_box">
              <img src="../../assets/images/img/did_img.png" alt="" />
            </div>
            <div class="dp-f flex-column text-box">
              <h4 class="title">광동상회 웹 페이지</h4>
              <p class="text">
                UHD 해상도 화면까지 고려한 반응형 작업<br/>
                작업 기간 : 2주<br/>
                퍼블리셔 기여도 : 100%
              </p>
              <button class="btn_com mt-at ml-at">자세히 보기</button>
            </div>
          </li>
          <li class="dp-f gap-30 pv-30">
            <div class="dp-f flex-column text-box">
              <h4 class="title">제주삼다수 웹 페이지</h4>
              <p class="text">
                KR 사이트 반응형 사이트 작업<br/>
                총 4명의 퍼블리셔와 협업으로 진행된 프로젝트<br/>
                작업 기간 : 5개월<br/>
                퍼블리셔 기여도 : 40% / 프론트 앤드 기여도 : 30%
              </p>
              <button class="btn_com mt-at ml-at">자세히 보기</button>
            </div>
            <div class="image_box">
              <img src="../../assets/images/img/golfStory_img.png" alt="" />
            </div>
          </li>
          <li class="ta-c pt-150" id="More">
            <button class="btn_com">다른 프로젝트 더보기</button>
          </li>
        </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

</script>

<style scoped lang="scss">
.content{
  width:1200px;
  margin:0 auto;
  padding:120px 0;
  
  ul{
    width:100%;
    
    li{
      width:100%;
      .image_box{
        width:100%; max-width:420px;
        aspect-ratio: 1;
        border-radius:20px;
        overflow: hidden;

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
          font-size:18px;
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
</style>