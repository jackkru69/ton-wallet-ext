<template>
  <VDialog eager v-model="isOpen" persistent max-width="325px">
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
            autofocus
            :error-messages="passwordErrors"
          ></VTextField
        ></VCardText>
        <VCardActions>
          <VSpacer></VSpacer>
          <VBtn text @click="rejectPromise()"> Cancel </VBtn>
          <VBtn text type="submit"> Submit </VBtn>
        </VCardActions>
      </VForm>
    </VCard>
  </VDialog>
</template>
<script lang="ts">
import { keystoreModuleMapper } from "@/store/modules/keystore";
import { sliceString } from "@/utils";
import { Component, Vue, Watch } from "vue-property-decorator";

const Mappers = Vue.extend({
  computed: {
    ...keystoreModuleMapper.mapGetters([
      "getKeyIDs",
      "getPrivateKeyData",
      "getPublicKeyData",
    ]),
  },
});

@Component({ methods: { sliceString } })
export default class TypePasswordModal extends Mappers {
  valid = true;
  isOpen = false;

  password = "";
  passwordErrors: string[] = [];

  resolvePromise: any = null;
  rejectPromise: any = null;

  @Watch("password")
  onChangePassword() {
    if (this.passwordErrors.length) {
      this.passwordErrors = [];
    }
  }

  show(address?: string) {
    return new Promise((resolve, reject) => {
      this.isOpen = true;

      this.resolvePromise = () => {
        try {
          if (address) {
            const keypair = {
              public: this.getPublicKeyData(address),
              secret: this.getPrivateKeyData(address, this.password),
            };
            resolve({ password: this.password, keypair });
          } else {
            this.getPrivateKeyData(this.getKeyIDs[0], this.password);
            resolve({ password: this.password });
          }

          this.isOpen = false;
        } catch (error) {
          this.passwordErrors = ["Invalid password"];
        }
      };

      this.rejectPromise = () => {
        reject(false);
        this.isOpen = false;
      };
    });
  }
}
</script>
