import { Getters, Mutations, Actions, Module, createMapper } from "vuex-smart-module";
import ApiService, { BalancesRequest } from "../../api-service";
import { convertAmountToUsd } from "../../utils/index";
import { sliceString } from "@/utils";

export interface Balance {
  id: string;
  externalId: string;
  ton: string;
  eth: string;
}

class BalancesState {
  balances: Balance[] = [];
  count = 0;
  total: object = {};
}

const formatItem = (item: Balance) => {
  return {
    ...item,
    formattedId: sliceString(item.id),
    formattedTon: sliceString(item.ton),
    formattedEth: sliceString(item.eth),
  };
};

class BalancesGetters extends Getters<BalancesState> {
  public get balances(): Balance[] {
    return this.state.balances;
  }

  public get formattedBalances() {
    return this.state.balances.map((item) => formatItem(item));
  }

  public get balancesCount(): number {
    return this.state.count;
  }

  public get balancesTotal(): {
    currency: string;
    amount: string;
    usd: string;
  }[] {
    return Object.keys(this.state.total).map((key) => {
      return {
        currency: key,
        //@ts-ignore
        amount: this.state.total[key],
        //@ts-ignore
        usd: convertAmountToUsd(key, this.state.total[key]) as string,
      };
    });
  }
}

class BalancesMutations extends Mutations<BalancesState> {
  public setBalances(payload: Balance[]) {
    this.state.balances = payload;
  }

  public setCount(payload: number) {
    this.state.count = payload;
  }

  public setTotal(payload: any[]) {
    this.state.total = payload;
  }
}

class BalancesActions extends Actions<BalancesState, BalancesGetters, BalancesMutations, BalancesActions> {
  public async fetchBalances(opts: BalancesRequest) {
    const responseHistory = await ApiService.getInstance().fetchBalances(opts);
    const responseCount = await ApiService.getInstance().fetchBalancesCount({ ...opts.where });

    this.mutations.setBalances(responseHistory.data);
    this.mutations.setCount(responseCount.data.count);
  }

  public async fetchBalanceTotal(opts?: BalancesRequest) {
    const responseTotal = await ApiService.getInstance().fetchBalancesTotal({ ...opts });
    this.mutations.setTotal(responseTotal.data);
  }
}

export const balances = new Module({
  state: BalancesState,
  getters: BalancesGetters,
  mutations: BalancesMutations,
  actions: BalancesActions,
});

export const balancesModuleMapper = createMapper(balances);
