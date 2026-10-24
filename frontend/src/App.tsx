import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { NewAnalysisPage } from './pages/NewAnalysisPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { JobsListPage } from './pages/JobsListPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5000,
    },
  },
});

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans antialiased">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppLayout>
            <NewAnalysisPage />
          </AppLayout>
        }
      />
      <Route path="/new" element={<Navigate to="/" replace />} />
      <Route
        path="/jobs"
        element={
          <AppLayout>
            <JobsListPage />
          </AppLayout>
        }
      />
      <Route
        path="/jobs/:id"
        element={
          <AppLayout>
            <JobDetailPage />
          </AppLayout>
        }
      />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
