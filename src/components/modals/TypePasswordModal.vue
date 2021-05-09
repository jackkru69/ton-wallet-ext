<template>
  <VDialog light v-model="isOpen" persistent max-width="325px">
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
        <VCardText class="pb-0">
          <VTextField
            autocomplete="off"
            v-model.trim="password"
            clearable
            :rules="[
              (v) => !!v || 'Password is required',
              (v) => validatePassword(v),
            ]"
            outlined
            label="Password"
            :append-icon="
              isHidePassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'
            "
            @click:append="() => (isHidePassword = !isHidePassword)"
            :type="isHidePassword ? 'password' : 'text'"
            :error-messages="passwordErrors"
          ></VTextField
        ></VCardText>
        <v-card-actions>
          <VSpacer></VSpacer>
          <VBtn x-small text @click="rejectPromise()"> Cancel </VBtn>
          <VBtn x-small text type="submit"> Submit </VBtn>
        </v-card-actions>
      </VForm>
    </VCard>
  </VDialog>
</template>
<script lang="ts">
import { sliceString } from "@/utils";
import { validatePassword } from "@/utils/validation";
import { Component, ModelSync, Prop, Vue } from "vue-property-decorator";

@Component({ methods: { sliceString, validatePassword } })
export default class TypePasswordModal extends Vue {
  valid = true;

  @ModelSync("change", "value", { type: String })
  password!: boolean;

  isHidePassword = true;

  @Prop() isOpen: boolean;
  @Prop() resolvePromise: any;
  @Prop() rejectPromise: any;
  @Prop() passwordErrors: string[];
}
</script>
