import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import FretboardTrainer from './pages/FretboardTrainer/FretboardTrainer';
import IntervalMath from './pages/IntervalMath/IntervalMath';
import ChordLibrary from './pages/ChordLibrary/ChordLibrary';
import { SettingsProvider } from './contexts/SettingsContext';

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/fretboard" element={<FretboardTrainer />} />
            <Route path="/interval-math" element={<IntervalMath />} />
            <Route path="/chords" element={<ChordLibrary />} />
            <Route path="/" element={<Navigate to="/fretboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}
