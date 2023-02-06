<template>
  <div>
    <Breadcrumb :items="['menu.three', 'menu.three.list']" />
    <div class="container">
      <div>
        123
      </div>
      <div>
        456
      </div>
    </div>
  </div>
</template>

<script lang="ts">

export default {
  name: "List",
  mounted() {
    alert(123);
  }
};

</script>
