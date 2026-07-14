import { useEffect, useState } from 'react';
import { SettingsPanel } from '../popup/components/SettingsPanel';
import type { ExtensionSettings } from '../shared/types';
import { DEFAULT_SETTINGS } from '../shared/constants';
import { getSettings, saveSettings } from '../shared/storage';

export default function OptionsApp() {
  const [settings, setSettings] = useState<ExtensionSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    void getSettings().then(setSettings);
  }, []);

  async function onChange(p: Partial<ExtensionSettings>) {
    await saveSettings(p);
    setSettings((prev) => ({ ...prev, ...p }));
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10 text-slate-100">
      <h1 className="mb-6 text-xl font-semibold">ShieldAI — Settings</h1>
      <SettingsPanel settings={settings} onChange={onChange} />
    </div>
  );
}
