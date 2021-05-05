<template>
  <VDialog :light="true" v-model="model" max-width="325px">
    <VCard>
      <VCardTitle>
        <h3>Custodians</h3>
      </VCardTitle>
      <VList
        ><VListItem v-for="(custodian, i) in custodians" :key="i"
          >{{ sliceString(custodian, 16)
          }}<VIcon role="button" class="ml-2" v-clipboard="() => custodian"
            >mdi-content-copy</VIcon
          ></VListItem
        ></VList
      >
    </VCard>
  </VDialog>
</template>
<script lang="ts">
import { sliceString } from "@/utils";
import { Component, Prop, VModel, Vue } from "vue-property-decorator";

@Component({ methods: { sliceString } })
export default class CustodiansModal extends Vue {
  @VModel() model: boolean;

  @Prop() custodians: any;
}
</script>
