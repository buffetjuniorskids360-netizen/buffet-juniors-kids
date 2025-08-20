import { Router, Route, Switch, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext, useAuthProvider, useAuth } from '@/hooks/useAuth';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppLayoutProvider, CustomLayout } from '@/components/AppLayout';
import { LoadingProvider } from '@/contexts/LoadingContext';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import Agenda from '@/pages/Agenda';
import Events from '@/pages/Events';
import CalendarView from '@/pages/CalendarView';
import Reports from '@/pages/Reports';
import CashFlow from '@/pages/CashFlow';
import Documents from '@/pages/Documents';
import About from '@/pages/About';
import { pageVariants, pageTransition, respectMotionPreference } from '@/lib/animations';
import { useEffect } from 'react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated && location !== '/login') {
      setLocation('/login');
    }
    if (!loading && isAuthenticated && (location === '/' || location === '/login')) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, loading, location, setLocation]);

  if (loading) {
    return (
      <motion.div 
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="text-center space-y-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.div 
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <motion.p 
            className="text-lg font-medium text-slate-700"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            Carregando...
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return <>{children}</>;
}

function App() {
  const authValue = useAuthProvider();
  const [location] = useLocation();

  return (
    <ErrorBoundary>
      <LoadingProvider>
        <AuthContext.Provider value={authValue}>
          <Router>
          <AnimatePresence mode="wait">
            <Switch location={location}>
            {/* Login Route - Custom Layout */}
            <Route path="/login">
              <CustomLayout variant="auth">
                <Login />
              </CustomLayout>
            </Route>
            
            {/* Protected Routes with App Layout */}
            <Route path="/dashboard">
              <ProtectedRoute>
                <AppLayoutProvider>
                  <ErrorBoundary>
                    <Dashboard />
                  </ErrorBoundary>
                </AppLayoutProvider>
              </ProtectedRoute>
            </Route>
            
            <Route path="/clients">
              <ProtectedRoute>
                <AppLayoutProvider>
                  <ErrorBoundary>
                    <Clients />
                  </ErrorBoundary>
                </AppLayoutProvider>
              </ProtectedRoute>
            </Route>
            
            <Route path="/agenda">
              <ProtectedRoute>
                <AppLayoutProvider>
                  <ErrorBoundary>
                    <Agenda />
                  </ErrorBoundary>
                </AppLayoutProvider>
              </ProtectedRoute>
            </Route>
            
            <Route path="/events">
              <ProtectedRoute>
                <AppLayoutProvider>
                  <ErrorBoundary>
                    <Events />
                  </ErrorBoundary>
                </AppLayoutProvider>
              </ProtectedRoute>
            </Route>
            
            <Route path="/calendar">
              <ProtectedRoute>
                <AppLayoutProvider>
                  <ErrorBoundary>
                    <CalendarView />
                  </ErrorBoundary>
                </AppLayoutProvider>
              </ProtectedRoute>
            </Route>
            
            <Route path="/reports">
              <ProtectedRoute>
                <AppLayoutProvider>
                  <ErrorBoundary>
                    <Reports />
                  </ErrorBoundary>
                </AppLayoutProvider>
              </ProtectedRoute>
            </Route>
            
            <Route path="/cashflow">
              <ProtectedRoute>
                <AppLayoutProvider>
                  <ErrorBoundary>
                    <CashFlow />
                  </ErrorBoundary>
                </AppLayoutProvider>
              </ProtectedRoute>
            </Route>
            
            <Route path="/documents">
              <ProtectedRoute>
                <AppLayoutProvider>
                  <ErrorBoundary>
                    <Documents />
                  </ErrorBoundary>
                </AppLayoutProvider>
              </ProtectedRoute>
            </Route>
            
            <Route path="/about">
              <ProtectedRoute>
                <AppLayoutProvider>
                  <ErrorBoundary>
                    <About />
                  </ErrorBoundary>
                </AppLayoutProvider>
              </ProtectedRoute>
            </Route>
            
            {/* Root redirect */}
            <Route path="/">
              <ProtectedRoute>
                <AppLayoutProvider>
                  <ErrorBoundary>
                    <Dashboard />
                  </ErrorBoundary>
                </AppLayoutProvider>
              </ProtectedRoute>
            </Route>
            </Switch>
          </AnimatePresence>
          </Router>
        </AuthContext.Provider>
      </LoadingProvider>
    </ErrorBoundary>
  );
}

export default App;
