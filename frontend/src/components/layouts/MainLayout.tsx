import { useState, useEffect } from 'react';
import { useInstrumentStore } from '../../stores/useInstrumentStore';
import { InstrumentList } from '../widgets/InstrumentList';
import { InstrumentCard } from '../widgets/InstrumentCard';
import { AddInstrumentDialog } from '../dialogs/AddInstrumentDialog';
import './MainLayout.css';

export function MainLayout() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const instruments = useInstrumentStore((state) => state.instruments);
  const currentSymbol = useInstrumentStore((state) => state.currentSymbol);
  const selectInstrument = useInstrumentStore((state) => state.selectInstrument);
  const addInstrument = useInstrumentStore((state) => state.addInstrument);

  const currentInstrument = instruments.find((i) => i.symbol === currentSymbol) || null;

  useEffect(() => {
    // Если текущий символ удалён или нет инструментов
    if (!currentInstrument && instruments.length > 0) {
      selectInstrument(instruments[0].symbol);
    } else if (instruments.length === 0) {
      selectInstrument(null);
    }
  }, [instruments, currentInstrument, selectInstrument]);

  const handleAddInstrument = (symbol: string) => {
    const success = addInstrument(symbol);
    if (success) {
      selectInstrument(symbol);
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="main-layout">
      <InstrumentList
        onSelectSymbol={selectInstrument}
        onAddClick={() => setIsDialogOpen(true)}
        currentSymbol={currentSymbol}
      />

      <div className="card-container">
        <InstrumentCard instrument={currentInstrument} />
      </div>

      <AddInstrumentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAdd={handleAddInstrument}
      />
    </div>
  );
}