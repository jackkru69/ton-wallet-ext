import { isEmpty } from "lodash";
import moment from "moment";
import BigNumber from "bignumber.js";

export function getQueryFromOptions(opts: { [key: string]: any }) {
  if (isEmpty(opts)) return "";
  return `?${Object.keys(opts)
    .map((key) => `${key}=${opts[key]}`)
    .join("&")}`;
}

export function getStringifyJsonFromOptionsLoopBack(opts?: { [key: string]: any }, prefix = "filter=") {
  if (isEmpty(opts)) return "";
  return `?${prefix}${encodeURIComponent(JSON.stringify(opts))}`;
}

export function sliceString(string: string | null, startEnd = 4) {
  if (!string) return "";
  return `${string.slice(0, startEnd)}...${string.slice(-startEnd)}`;
}

export function formatDate(value: number, format = "DD.MM.YYYY, HH:mm") {
  if (!value) return "";
  return moment(value).format(format);
}

export const baseToAssetAmount = (amount: string, currency: "ETH" | "USDT" | "TON", fixed?: number) => {
  if (!amount) return "";
  switch (currency) {
    case "ETH":
      return new BigNumber(amount).dividedBy(1000000000000000000).toFixed(fixed || 18);
    case "TON":
      return new BigNumber(amount).dividedBy(1000000000).toFixed(fixed || 9);
    case "USDT":
      return new BigNumber(amount).dividedBy(1000000000000000000).toFixed(fixed || 18);
  }
};

export const assetToBaseAmount = (amount: string, currency: "ETH" | "USDT" | "TON") => {
  if (!amount) return "";
  switch (currency) {
    case "ETH":
      return new BigNumber(amount).multipliedBy(1000000000000000000).toString();
    case "TON":
      return new BigNumber(amount).multipliedBy(1000000000).toString();
    case "USDT":
      return new BigNumber(amount).multipliedBy(1000000000000000000).toString();
  }
};

export const convertAmountToUsd = (provider: string, amount: string) => {
  switch (provider) {
    case "TON":
      return new BigNumber(amount).multipliedBy("0.6787").toFixed(3);
    case "ETH":
      return new BigNumber(amount).multipliedBy("1795.53").toFixed(3);
    case "USDT":
      return new BigNumber(amount).multipliedBy("1").toFixed(3);
  }
};

export const findAccByAddressAndReturnIndex = (array: any[], address: any) =>
  array.findIndex((item) => item.address === address);

export const findTokenBySymbolAndReturnIndex = (array: any[], symbol: any) =>
  array.findIndex((item) => item.symbol === symbol);
