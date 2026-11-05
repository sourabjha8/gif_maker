import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Homepage } from './pages/Homepage';
import { Editor } from './pages/Editor';
import { colors } from './constants/theme';

// Remounting Editor per project id (instead of letting it re-render in place) means
// its data-loading hooks only ever run once per mount — no manual state resets needed
// when navigating from one project straight into another.
function EditorRoute() {
  const { id } = useParams<{ id: string }>();
  return <Editor key={id} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className={`min-h-screen w-full flex flex-col font-sans ${colors.bg} ${colors.textPrimary} selection:bg-[#0099ff]/30`}>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/editor/:id/:slug" element={<EditorRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
