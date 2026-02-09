import { useState, useEffect } from 'react';
import * as ApiClientModule from '@project/api-client';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardTabs } from '@/components/layout/DashboardTabs';
import { useDataStore } from '@/stores/dataStore';
import { useMeasuringPointsForChurches } from '@/hooks/useTimeSeriesData';

const ApiClientClass = (ApiClientModule as { default?: new () => unknown }).default ?? ApiClientModule;

function App() {
  const [apiClient] = useState(() => (typeof ApiClientClass === 'function' ? new (ApiClientClass as new () => unknown)() : null));
  const setApiClient = useDataStore((s) => s.setApiClient);
  const fetchObjectTree = useDataStore((s) => s.fetchObjectTree);
  const loading = useDataStore((s) => s.loading);
  const error = useDataStore((s) => s.error);
  const clearError = useDataStore((s) => s.clearError);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (apiClient && typeof (apiClient as { setAccessToken?: (t: string) => void }).setAccessToken === 'function') {
      if (token) (apiClient as { setAccessToken: (t: string) => void }).setAccessToken(token);
      setApiClient(apiClient as Parameters<typeof setApiClient>[0]);
    }
  }, [apiClient, setApiClient]);

  useMeasuringPointsForChurches();

  useEffect(() => {
    const client = useDataStore.getState().apiClient;
    if (!client) return;
    fetchObjectTree();
  }, [fetchObjectTree]);

  return (
    <AppShell>
      {error && (
        <div className="mb-4 rounded border border-[#dca7a7] bg-[#f2dede] p-3 text-sm text-[#b94a48] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_2px_rgba(0,0,0,0.05)]">
          {error}
          <button type="button" onClick={clearError} className="ml-2 font-semibold underline">
            Schließen
          </button>
        </div>
      )}
      {loading && (
        <div className="mb-4 text-sm text-[#666]">Lade Daten…</div>
      )}
      <DashboardTabs />
    </AppShell>
  );
}

export default App;
