<template>
  <div class="v-lock-screen-page py-8">
    <Inner>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="onSubmit"
      >
        <h1 class="mb-8">Unlock wallet</h1>
        <h2 class="mb-8">Password</h2>
        <VTextField
          autocomplete="off"
          class="mb-8"
          v-model.trim="password"
          clearable
          :rules="[(v) => !!v || 'Password is required']"
          outlined
          label="Password"
          :error-messages="passwordErrors"
        ></VTextField>

        <div class="d-flex justify-center">
          <VBtn x-small color="primary" type="submit" :disabled="!password">
            Unlock
          </VBtn>
        </div>
      </VForm></Inner
    >
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import { rootModuleMapper } from "@/store/root";
import { keystoreModuleMapper } from "@/store/modules/keystore";

const Mappers = Vue.extend({
  computed: {
    ...keystoreModuleMapper.mapGetters(["getKeyIDs", "getPrivateData"]),
  },
  methods: {
    ...rootModuleMapper.mapMutations(["setIsLocked"]),
  },
});

@Component({
  components: { Inner },
})
export default class LockScreenPage extends Mappers {
  valid = true;

  password = "";
  passwordErrors: string[] = [];

  @Watch("password")
  onChangePassword() {
    if (this.passwordErrors.length) {
      this.passwordErrors = [];
    }
  }

  onSubmit() {
    try {
      this.getPrivateData(this.getKeyIDs[0], this.password);
      this.setIsLocked(false);
      this.$router.push("/");
    } catch (error) {
      this.passwordErrors = ["Invalid password"];
    }
  }
}
</script>

