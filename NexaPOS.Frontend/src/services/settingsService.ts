// src/services/settingsService.ts

export type NexaSettings = {
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;

  currency: string;
  taxRate: string;

  invoicePrefix: string;
  invoiceFooter: string;

  notifications: boolean;
  lowStockAlerts: boolean;

  soundEffects: boolean;
  compactMode: boolean;
};

export const SETTINGS_KEY = "nexapos_settings";

export const SETTINGS_EVENT = "nexapos-settings-changed";

export const defaultSettings: NexaSettings = {
  businessName: "NexaPOS Retail",
  businessPhone: "",
  businessEmail: "",
  businessAddress: "",

  currency: "LKR",
  taxRate: "0",

  invoicePrefix: "INV-",
  invoiceFooter: "Thank you for shopping with us!",

  notifications: true,
  lowStockAlerts: true,

  soundEffects: false,
  compactMode: false,
};

export function getSettings(): NexaSettings {
  if (typeof window === "undefined") {
    return { ...defaultSettings };
  }

  const saved = window.localStorage.getItem(SETTINGS_KEY);

  if (!saved) {
    return { ...defaultSettings };
  }

  try {
    const parsed = JSON.parse(saved);

    return {
      ...defaultSettings,
      ...parsed,
    };
  } catch (error) {
    console.error("Invalid NexaPOS settings:", error);

    return { ...defaultSettings };
  }
}

export function saveSettings(
  settings: NexaSettings,
): NexaSettings {
  const value: NexaSettings = {
    ...defaultSettings,
    ...settings,
  };

  window.localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(value),
  );

  window.dispatchEvent(
    new CustomEvent(SETTINGS_EVENT, {
      detail: value,
    }),
  );

  return value;
}

export function resetSettings(): NexaSettings {
  const value = { ...defaultSettings };

  window.localStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify(value),
  );

  window.dispatchEvent(
    new CustomEvent(SETTINGS_EVENT, {
      detail: value,
    }),
  );

  return value;
}