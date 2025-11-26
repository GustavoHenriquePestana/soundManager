import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { User, Equipment, AppNotification } from './types';
import { storageService } from './services/storage';
import { ShieldCheck, User as UserIcon, Loader2 } from 'lucide-react';
import { Toaster } from './components/ui/toaster';
import { ErrorBoundary } from './components/ErrorBoundary';
import { toast } from 'sonner';
import { ReportModal } from './components/ReportModal';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Inventory = React.lazy(() => import('./pages/Inventory').then(module => ({ default: module.Inventory })));
const Maintenance = React.lazy(() => import('./pages/Maintenance').then(module => ({ default: module.Maintenance })));
const UserManagement = React.lazy(() => import('./pages/UserManagement').then(module => ({ default: module.UserManagement })));
const NotFound = React.lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));

// Simple Login Component
const LoginScreen = ({ onLogin }: { onLogin: (username: string, password?: string) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    try {
      await onLogin(username, password);
    } catch (error) {
      console.error(error);
      toast.error("Falha no login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
          <ShieldCheck className="text-white" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">SoundManager</h1>
        <p className="text-slate-500 mb-8">Entre com suas credenciais</p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Usuário</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="admin ou user"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Digite sua senha"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={20} />}
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportItem, setReportItem] = useState<Equipment | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const refreshData = async () => {
    if (equipment.length === 0) setLoading(true);

    const data = await storageService.getAll();
    setEquipment(data);

    if (user) {
      const notifs = await storageService.getNotifications(user.id, user.role);
      setNotifications(notifs);
    }

    if (equipment.length === 0) setLoading(false);
  };

  useEffect(() => {
    if (user) {
      refreshData();
      const interval = setInterval(refreshData, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogin = async (username: string, password?: string) => {
    const user = await storageService.login(username, password);
    setUser(user);
    navigate(user.role === 'admin' ? '/dashboard' : '/inventory');
    toast.success(`Bem-vindo, ${user.name}!`);
  };

  const handleReportIssue = async (description: string) => {
    if (reportItem && user) {
      await storageService.addLog(reportItem.id, {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        description,
        reportedBy: user.name,
        reportedById: user.id
      });
      setReportItem(null);
      refreshData();
      toast.success('Problema reportado com sucesso!');
    }
  };

  const handleMarkRead = async (id: string) => {
    await storageService.markNotificationRead(id);
    if (user) {
      const notifs = await storageService.getNotifications(user.id, user.role);
      setNotifications(notifs);
    }
  };

  const handleMarkAllRead = async () => {
    if (user) {
      await storageService.markAllRead(user.id, user.role);
      const notifs = await storageService.getNotifications(user.id, user.role);
      setNotifications(notifs);
      toast.success('Todas as notificações marcadas como lidas');
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (loading && equipment.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-screen">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p>Carregando inventário...</p>
      </div>
    );
  }

  // Map current path to view ID for Layout
  const getCurrentView = () => {
    const path = location.pathname.substring(1);
    return path || 'dashboard';
  };

  return (
    <Layout
      user={user}
      currentView={getCurrentView()}
      notifications={notifications}
      onNavigate={(view) => navigate(`/${view}`)}
      onLogout={() => {
        setUser(null);
        navigate('/');
        toast.info('Você saiu do sistema');
      }}
      onMarkRead={handleMarkRead}
      onMarkAllRead={handleMarkAllRead}
    >
      <Suspense fallback={
        <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[50vh]">
          <Loader2 className="animate-spin mb-2" size={32} />
          <p>Carregando...</p>
        </div>
      }>
        <Routes>
          <Route path="/dashboard" element={<Dashboard equipment={equipment} />} />
          <Route path="/inventory" element={
            <Inventory
              equipment={equipment}
              userRole={user.role}
              onRefresh={refreshData}
              onEdit={(item) => console.log('Edit', item)}
              onReport={(item) => setReportItem(item)}
            />
          } />
          <Route path="/maintenance" element={
            <Maintenance
              equipment={equipment}
              userRole={user.role}
              onRefresh={refreshData}
            />
          } />
          <Route path="/users" element={
            user.role === 'admin' ? <UserManagement /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="/" element={<Navigate to={user.role === 'admin' ? "/dashboard" : "/inventory"} replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <ReportModal
        isOpen={!!reportItem}
        onClose={() => setReportItem(null)}
        onSubmit={handleReportIssue}
      />
    </Layout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
        <Toaster />
      </BrowserRouter>
    </ErrorBoundary>
  );
}