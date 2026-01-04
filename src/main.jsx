import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import router from './routes/router';
import { TrackContextProvider } from './contexts/track.context.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <TrackContextProvider>
        <RouterProvider router={router} />
      </TrackContextProvider>
    </AuthProvider>
  </StrictMode>
);
