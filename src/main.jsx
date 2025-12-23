import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import router from './routes/router';
import { RouterProvider } from 'react-router-dom';
import { TrackContextProvider } from './contexts/track.context.jsx';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <TrackContextProvider>
      <RouterProvider router={router} />
    </TrackContextProvider>
  </StrictMode>
)
