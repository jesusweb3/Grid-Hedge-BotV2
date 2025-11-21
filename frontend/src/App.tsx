import { useEffect } from 'react';
import { useInstrumentStore } from './stores/useInstrumentStore';
import { MainLayout } from './components/layouts/MainLayout';

function App() {
  const initialize = useInstrumentStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return <MainLayout />;
}

export default App;