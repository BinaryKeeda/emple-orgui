import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { UserProvider } from './context/UserContext';
import { AuthProvider } from '@descope/react-sdk';

// Correct QueryClient instantiation
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <SnackbarProvider
    maxSnack={3}
    autoHideDuration={3000}
    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
  >
    <AuthProvider
      projectId={import.meta.env.VITE_APP_DESCOPE_PROJECT_ID}
      sessionTokenViaCookie={true}
      refreshTokenViaCookie={true}
      persistTokens
    >

      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <Provider store={store}>
            <App />
          </Provider>
        </UserProvider>
      </QueryClientProvider>
    </AuthProvider>
  </SnackbarProvider >

);
