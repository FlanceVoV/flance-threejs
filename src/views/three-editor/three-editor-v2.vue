<template>
  <div>
    <div class="container" style="width: 100%; height: 100%">
      <div>header</div>
      <div
        id="content"
        style="
        position: absolute;
        width: calc(100% - 230px);
        height: calc(100% - 230px);
      "
        @contextmenu="void 0"
      >
      </div>
      <div>
        footer
      </div>
    </div>
  </div>

</template>

<script lang="ts">

import { Scene } from "@/components/threejs/objects/scene";

let container;

export default ({
  data() {
    return {};
  },
  mounted() {
    let that = this as any;
    container = document.getElementById("content");
    let scene = new Scene("测试场景", ["#content"]);
    console.log(scene);
  },
  methods: {}

});
</script>
