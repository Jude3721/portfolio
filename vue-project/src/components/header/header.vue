<template>
  <div class="header">
    <div class="content">
      <h1 class="wd-120 hp-60" @click="top()">
        <img src="../../assets/images/img/joo.svg" alt="로고" class="ic-color-ffffff"/>
      </h1>
    </div>
  </div>
</template>

<script setup>

const top = () =>{
  window.scrollTo({top: 0, behavior: 'smooth'});
}
</script>

<style scoped lang="scss">
.header{
  position:fixed;
  left:0; top:0;
  width:100%;
  padding:14px 0;
  background-color:rgba(0,0,0,0.5);
  border-bottom:1px solid #000000;
  z-index:10;
}

.content{
  width:1200px;
  margin:0 auto;

  @media all and (max-width:1200px){
    width:100%;
  }

  h1{
    cursor:pointer;
      
    @media all and (max-width:1200px){
      width:10vw !important; height:5vw !important;
      margin-left:3%;
    }
  }
}

</style>