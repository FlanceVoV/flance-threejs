<template>
  <div>
    <div class="container" style="width: 100%; height: 100%; ">
      <div>header</div>
      <div
        id="content"
        style="
        position: absolute;
        width: 300px;
        height: 300px;
      "
        @contextmenu="void 0"
      >
      </div>
      <div style="height: 320px"></div>

      <div id="content2"
           style="
        position: absolute;
        width: 300px;
        height: 300px;
      "
           @contextmenu="void 0">

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
    let scene = new Scene("测试场景", ["#content", "#content2"]);
    console.log(scene);
  },
  methods: {}

});
</script>
