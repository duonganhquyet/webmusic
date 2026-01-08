import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import NotificationInit from './components/NotificationInit'; // Import component thông báo
import { TrackContextProvider } from './contexts/track.context.jsx';
import { AuthContextProvider } from './contexts/auth.context.jsx';

import router from './routes/router';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthContextProvider>
      <TrackContextProvider>
      <NotificationInit />
        <RouterProvider router={router} />
      </TrackContextProvider>
    </AuthContextProvider>
  </StrictMode>
);
