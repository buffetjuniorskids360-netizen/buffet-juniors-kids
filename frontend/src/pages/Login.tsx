import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import HeroSection from '@/components/HeroSection';
import { 
  pageVariants, 
  pageTransition, 
  containerVariants, 
  itemVariants, 
  feedbackVariants,
  modalVariants
} from '@/lib/animations';
import { Crown, Lock, User } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [_error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(username, password);
      
      if (success) {
        console.log('🎉 Login successful, redirecting to dashboard...');
        setLocation('/dashboard');
      } else {
        setError('Credenciais inválidas. Verifique seu username e senha.');
      }
    } catch (_err) {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    setShowLoginModal(true);
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <HeroSection onGetStarted={handleGetStarted} />

      {/* Login Modal */}
      {showLoginModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={(e) => e.target === e.currentTarget && setShowLoginModal(false)}
        >
          <motion.div
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="w-full border-0 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                >
                  <Crown className="w-8 h-8 text-white" />
                </motion.div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Acesso ao Sistema
                </CardTitle>
                <p className="text-gray-600">
                  Entre com suas credenciais para continuar
                </p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <motion.form 
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                >
                  <motion.div className="space-y-3" variants={itemVariants}>
                    <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="Digite seu username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                        className="h-12 pl-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div className="space-y-3" variants={itemVariants}>
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Senha
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="h-12 pl-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </motion.div>

                  {_error && (
                    <motion.div 
                      className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4"
                      variants={feedbackVariants}
                      animate="error"
                      initial={{ opacity: 0 }}
                    >
                      {_error}
                    </motion.div>
                  )}

                  <motion.div variants={itemVariants} className="flex gap-3">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setShowLoginModal(false)}
                      className="w-full h-12"
                      disabled={loading}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700" 
                      disabled={loading || !username || !password}
                      loading={loading}
                    >
                      {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                  </motion.div>

                </motion.form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}