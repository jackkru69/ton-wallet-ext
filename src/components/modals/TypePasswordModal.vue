<template>
  <VDialog v-model="isOpen" persistent max-width="325px">
    <VCard>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="resolvePromise"
      >
        <VCardTitle>
          <h3>Type your password</h3>
        </VCardTitle>
        <VCardText>
          <VTextField
            v-model.trim="password"
            clearable
            :rules="[(v) => !!v || 'Password is required']"
            outlined
            label="Password"
            type="password"
            :error-messages="passwordErrors"
          ></VTextField
        ></VCardText>
        <v-card-actions>
          <VSpacer></VSpacer>
          <VBtn text @click="rejectPromise()"> Cancel </VBtn>
          <VBtn text type="submit"> Submit </VBtn>
        </v-card-actions>
      </VForm>
    </VCard>
  </VDialog>
</template>
<script lang="ts">
import { sliceString } from "@/utils";
import { Component, ModelSync, Prop, Vue } from "vue-property-decorator";

@Component({ methods: { sliceString } })
export default class TypePasswordModal extends Vue {
  valid = true;

  @ModelSync("change", "value", { type: String })
  password!: boolean;

  @Prop() isOpen: boolean;
  @Prop() resolvePromise: any;
  @Prop() rejectPromise: any;
  @Prop() passwordErrors: string[];
}
</script>
