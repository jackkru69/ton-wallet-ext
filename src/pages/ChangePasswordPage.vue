<template>
  <div class="v-create-wallet-page pb-8">
    <Inner>
      <VForm
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="onSubmit"
      >
        <h1 class="mb-5">Change password</h1>
        <VTextField
          autocomplete="off"
          dense
          v-model.trim="oldPassword"
          clearable
          :rules="[(v) => !!v || 'Old password is required']"
          outlined
          :error-messages="passwordErrors"
          label="Old password"
        ></VTextField>
        <VTextField
          autocomplete="off"
          dense
          v-model.trim="newPassword"
          clearable
          :rules="[(v) => !!v || 'Password is required']"
          outlined
          label="Password"
        ></VTextField>
        <VTextField
          autocomplete="off"
          dense
          v-model.trim="confirmNewPassword"
          clearable
          :rules="[
            (v) => !!v || 'Confirm password is required',
            (v) => newPassword === v || 'Passwords don\'t match',
          ]"
          outlined
          label="Confirm password"
        ></VTextField>
        <div class="d-flex justify-end">
          <VBtn
            x-small
            width="80"
            to="/"
            class="mr-4"
            :light="true"
            color="white"
          >
            Back
          </VBtn>
          <VBtn
            x-small
            width="80"
            color="primary"
            type="submit"
            :disabled="!oldPassword || !newPassword || !confirmNewPassword"
          >
            Change
          </VBtn>
        </div>
      </VForm>
    </Inner>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import Inner from "@/components/layout/Inner.vue";
import { accountsModuleMapper } from "@/store/modules/accounts";
import { walletModuleMapper } from "@/store/modules/wallet";
import { isEmpty } from "lodash";
import { keystoreModuleMapper } from "@/store/modules/keystore";

const Mappers = Vue.extend({
  computed: {
    ...walletModuleMapper.mapGetters(["activeNetworkServer"]),
    ...accountsModuleMapper.mapGetters([
      "getAccountByAddress",
      "accountsCount",
    ]),
  },
  methods: {
    ...keystoreModuleMapper.mapActions(["changePassword"]),
    isEmpty,
  },
});

@Component({
  components: { Inner },
})
export default class ChangePasswordPage extends Mappers {
  valid = true;

  oldPassword = "";
  newPassword = "";
  confirmNewPassword = "";

  passwordErrors: string[] = [];

  @Watch("oldPassword")
  onChangePassword() {
    if (this.passwordErrors.length) {
      this.passwordErrors = [];
    }
  }
  async onSubmit() {
    const { oldPassword, newPassword } = this;
    try {
      this.changePassword({ password: oldPassword, newPassword });
      this.$router.push("/");
    } catch (error) {
      this.passwordErrors = ["Invalid password"];
    }
  }
}
</script>

