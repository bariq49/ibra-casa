import SystemConfig, {
  ISystemConfigDocument,
} from "../models/systemConfigModel.js";

export type StoreSettings = {
  enableStripe: boolean;
  enableCod: boolean;
  enableBankTransfer: boolean;
  enablePaypal: boolean;
  taxRate: number;
  shippingCost: number;
  freeDeliveryThreshold: number;
  currency: string;
  storeName: string;
  supportEmail: string;
  apiLogLevel: "all" | "error" | "success" | "none";
};

const defaultsFromEnv = (): Omit<StoreSettings, "apiLogLevel"> & {
  apiLogLevel: StoreSettings["apiLogLevel"];
} => ({
  enableStripe: true,
  enableCod: true,
  enableBankTransfer: false,
  enablePaypal: false,
  taxRate: parseFloat(process.env.TAX_RATE || "0"),
  shippingCost: parseFloat(process.env.SHIPPING_COST || "0"),
  freeDeliveryThreshold: parseFloat(
    process.env.FREE_DELIVERY_THRESHOLD || "999",
  ),
  currency: (process.env.CURRENCY || "USD").toUpperCase(),
  storeName: process.env.STORE_NAME || "Ibra Casa",
  supportEmail: process.env.SUPPORT_EMAIL || "",
  apiLogLevel: "error",
});

export async function getOrCreateSystemConfig(): Promise<ISystemConfigDocument> {
  let config = await SystemConfig.findOne();
  if (!config) {
    const defaults = defaultsFromEnv();
    config = await SystemConfig.create(defaults);
  }
  return config;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const config = await getOrCreateSystemConfig();
  const env = defaultsFromEnv();

  return {
    enableStripe: config.enableStripe ?? env.enableStripe,
    enableCod: config.enableCod ?? env.enableCod,
    enableBankTransfer: config.enableBankTransfer ?? env.enableBankTransfer,
    enablePaypal: config.enablePaypal ?? env.enablePaypal,
    taxRate:
      typeof config.taxRate === "number" ? config.taxRate : env.taxRate,
    shippingCost:
      typeof config.shippingCost === "number"
        ? config.shippingCost
        : env.shippingCost,
    freeDeliveryThreshold:
      typeof config.freeDeliveryThreshold === "number"
        ? config.freeDeliveryThreshold
        : env.freeDeliveryThreshold,
    currency: config.currency || env.currency,
    storeName: config.storeName || env.storeName,
    supportEmail: config.supportEmail || env.supportEmail,
    apiLogLevel: config.apiLogLevel || env.apiLogLevel,
  };
}

export function calcShipping(
  subtotal: number,
  settings: Pick<StoreSettings, "shippingCost" | "freeDeliveryThreshold">,
): number {
  if (
    settings.freeDeliveryThreshold > 0 &&
    subtotal >= settings.freeDeliveryThreshold
  ) {
    return 0;
  }
  return settings.shippingCost;
}
