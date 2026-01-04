import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { TrackContextProvider } from './contexts/track.context.jsx';
import { AuthContextProvider } from './contexts/auth.context.jsx';

import router from './routes/router';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthContextProvider>
      <TrackContextProvider>
        <RouterProvider router={router} />
      </TrackContextProvider>
    </AuthContextProvider>
  </StrictMode>
);
