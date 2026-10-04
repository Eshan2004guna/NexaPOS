import { useEffect, useState, type ReactNode } from "react";

import {
  Bell,
  Building2,
  Check,
  DollarSign,
  FileText,
  Palette,
  RotateCcw,
  Save,
  Settings as SettingsIcon,
} from "lucide-react";

import {
  getSettings,
  resetSettings,
  saveSettings,
  SETTINGS_EVENT,
  type NexaSettings,
} from "../../services/settingsService";

export default function Settings() {
  const [settings, setSettings] = useState<NexaSettings>(
    () => getSettings(),
  );

  const [saved, setSaved] = useState(false);

  /*
   * Reload settings if another part of NexaPOS changes them.
   */
  useEffect(() => {
    const handleSettingsChanged = () => {
      setSettings(getSettings());
    };

    window.addEventListener(
      SETTINGS_EVENT,
      handleSettingsChanged,
    );

    return () => {
      window.removeEventListener(
        SETTINGS_EVENT,
        handleSettingsChanged,
      );
    };
  }, []);

  /*
   * Update one setting.
   */
  const updateField = <K extends keyof NexaSettings>(
    field: K,
    value: NexaSettings[K],
  ) => {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
  };

  /*
   * Save settings.
   */
  const handleSave = () => {
    try {
      const savedSettings = saveSettings(settings);

      setSettings(savedSettings);
      setSaved(true);

      console.log(
        "NexaPOS settings saved:",
        savedSettings,
      );

      window.setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to save NexaPOS settings:",
        error,
      );

      alert("Failed to save settings.");
    }
  };

  /*
   * Reset settings.
   */
  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset all settings to default values?",
    );

    if (!confirmed) {
      return;
    }

    try {
      const reset = resetSettings();

      setSettings(reset);
      setSaved(true);

      window.setTimeout(() => {
        setSaved(false);
      }, 2000);
    } catch (error) {
      console.error(
        "Failed to reset NexaPOS settings:",
        error,
      );

      alert("Failed to reset settings.");
    }
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <SettingsIcon size={22} />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Settings
          </h1>

          <p className="text-sm text-slate-500">
            Manage your NexaPOS settings.
          </p>
        </div>
      </div>

      {/* BUSINESS INFORMATION */}

      <Section
        icon={<Building2 size={20} />}
        title="Business Information"
        description="Business information used by NexaPOS."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Business Name"
            value={settings.businessName}
            onChange={(value) =>
              updateField("businessName", value)
            }
          />

          <Input
            label="Business Phone"
            value={settings.businessPhone}
            onChange={(value) =>
              updateField("businessPhone", value)
            }
          />

          <Input
            label="Business Email"
            value={settings.businessEmail}
            onChange={(value) =>
              updateField("businessEmail", value)
            }
          />

          <Input
            label="Business Address"
            value={settings.businessAddress}
            onChange={(value) =>
              updateField("businessAddress", value)
            }
          />
        </div>
      </Section>

      {/* CURRENCY AND TAX */}

      <Section
        icon={<DollarSign size={20} />}
        title="Currency & Tax"
        description="Configure currency and tax information."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Currency
            </label>

            <select
              value={settings.currency}
              onChange={(event) =>
                updateField(
                  "currency",
                  event.target.value,
                )
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="LKR">
                Sri Lankan Rupee (LKR)
              </option>

              <option value="USD">
                US Dollar (USD)
              </option>

              <option value="EUR">
                Euro (EUR)
              </option>

              <option value="GBP">
                British Pound (GBP)
              </option>

              <option value="INR">
                Indian Rupee (INR)
              </option>
            </select>
          </div>

          <Input
            label="Tax Rate (%)"
            type="number"
            value={settings.taxRate}
            onChange={(value) =>
              updateField("taxRate", value)
            }
          />
        </div>
      </Section>

      {/* INVOICE SETTINGS */}

      <Section
        icon={<FileText size={20} />}
        title="Invoice Settings"
        description="Configure invoice information."
      >
        <div className="space-y-5">
          <Input
            label="Invoice Prefix"
            value={settings.invoicePrefix}
            onChange={(value) =>
              updateField("invoicePrefix", value)
            }
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Invoice Footer
            </label>

            <textarea
              value={settings.invoiceFooter}
              onChange={(event) =>
                updateField(
                  "invoiceFooter",
                  event.target.value,
                )
              }
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>
      </Section>

      {/* NOTIFICATIONS */}

      <Section
        icon={<Bell size={20} />}
        title="Notifications"
        description="Control application notifications."
      >
        <div className="space-y-4">
          <Toggle
            title="System Notifications"
            description="Show system notifications."
            value={settings.notifications}
            onChange={(value) =>
              updateField("notifications", value)
            }
          />

          <Toggle
            title="Low Stock Alerts"
            description="Show alerts when products are low in stock."
            value={settings.lowStockAlerts}
            onChange={(value) =>
              updateField("lowStockAlerts", value)
            }
          />
        </div>
      </Section>

      {/* APPEARANCE */}

      <Section
        icon={<Palette size={20} />}
        title="Appearance"
        description="Configure application appearance."
      >
        <div className="space-y-4">
          <Toggle
            title="Sound Effects"
            description="Enable POS sound effects."
            value={settings.soundEffects}
            onChange={(value) =>
              updateField("soundEffects", value)
            }
          />

          <Toggle
            title="Compact Mode"
            description="Use a compact interface layout."
            value={settings.compactMode}
            onChange={(value) =>
              updateField("compactMode", value)
            }
          />
        </div>
      </Section>

      {/* ACTIONS */}

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          <RotateCcw size={17} />
          Reset Defaults
        </button>

        <div className="flex items-center justify-end gap-4">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <Check size={17} />
              Saved
            </span>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Save size={17} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   SECTION
============================================================ */

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}

/* ============================================================
   INPUT
============================================================ */

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

/* ============================================================
   TOGGLE
============================================================ */

function Toggle({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <div>
        <p className="text-sm font-medium text-slate-800">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        aria-label={title}
        aria-pressed={value}
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition ${
          value ? "bg-blue-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            value ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}