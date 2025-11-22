import { useState, useEffect } from 'react';
import { useInstrumentStore, type AddInstrumentResult } from '../../stores/useInstrumentStore';
import { InstrumentList } from '../widgets/InstrumentList';
import { InstrumentCard } from '../widgets/InstrumentCard';
import { AddInstrumentDialog } from '../dialogs/AddInstrumentDialog';
import { AdminSettingsDialog } from '../dialogs/AdminSettingsDialog';
import { apiClient } from '../../utils/apiClient';
import './MainLayout.css';

export function MainLayout() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsConfigured, setSettingsConfigured] = useState(false);
  const instruments = useInstrumentStore((state) => state.instruments);
  const currentSymbol = useInstrumentStore((state) => state.currentSymbol);
  const selectInstrument = useInstrumentStore((state) => state.selectInstrument);
  const addInstrument = useInstrumentStore((state) => state.addInstrument);
  const initialize = useInstrumentStore((state) => state.initialize);

  const currentInstrument = currentSymbol
    ? instruments.find((i) => i.symbol === currentSymbol) || null
    : null;

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    let isMounted = true;

    const loadStatus = async () => {
      try {
        const status = await apiClient.getSettingsStatus();
        if (isMounted) {
          setSettingsConfigured(Boolean(status.configured));
        }
      } catch (error) {
        console.error('Failed to fetch settings status:', error);
        if (isMounted) {
          setSettingsConfigured(false);
        }
      }
    };

    void loadStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (instruments.length === 0) {
      if (currentSymbol !== null) {
        selectInstrument(null);
      }
      return;
    }

    const currentExists = instruments.some((i) => i.symbol === currentSymbol);
    if (!currentExists) {
      selectInstrument(instruments[0].symbol);
    }
  }, [instruments.length, currentSymbol, selectInstrument]);

  const handleAddInstrument = async (symbol: string): Promise<AddInstrumentResult> => {
    const result = await addInstrument(symbol);
    if (result.success && result.instrument) {
      selectInstrument(result.instrument.symbol);
      setIsDialogOpen(false);
    }
    return result;
  };

  return (
    <div className="main-layout">
      <InstrumentList
        onSelectSymbol={selectInstrument}
        onAddClick={() => setIsDialogOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentSymbol={currentSymbol}
        settingsConfigured={settingsConfigured}
      />

      <div className="card-container">
        <InstrumentCard instrument={currentInstrument} />
      </div>

      <AddInstrumentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAdd={handleAddInstrument}
      />
      <AdminSettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsUpdated={setSettingsConfigured}
      />
    </div>
  );
}