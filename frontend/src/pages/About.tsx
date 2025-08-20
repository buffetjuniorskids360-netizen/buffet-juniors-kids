import { motion } from 'framer-motion';
import { Card, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Info, 
  Crown, 
  BarChart3, 
  Calendar, 
  Users, 
  CreditCard, 
  Receipt, 
  FileText,
  User,
  Github,
  Linkedin,
  Mail
} from 'lucide-react';
import { pageVariants, pageTransition, containerVariants, itemVariants } from '@/lib/animations';
import { SYSTEM_INFO, CARD_STYLES } from '@/lib/constants';

export default function About() {
  return (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
      className="p-6 space-y-8"
    >
      {/* Header da Página */}
      <motion.div 
        variants={itemVariants}
        className="flex items-center gap-4 mb-8"
      >
        <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
          <Info className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Sobre o Sistema</h1>
          <p className="text-slate-500">{SYSTEM_INFO.name}</p>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="space-y-8"
      >
        {/* Seção 1: Apresentação */}
        <motion.div variants={itemVariants}>
          <Card className={CARD_STYLES.primary}>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-900">Buffet Junior's Kids</h2>
                <p className="text-slate-600 max-w-2xl mx-auto">
                  Sistema financeiro completo especializado em buffets infantis. 
                  Desenvolvido com foco em usabilidade intuitiva e estética premium, 
                  unindo eficiência operacional com experiência visual excepcional.
                </p>
                <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
                  <span>Versão {SYSTEM_INFO.version}</span>
                  <span>•</span>
                  <span>{SYSTEM_INFO.releaseDate}</span>
                  <span>•</span>
                  <span>React + TypeScript</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Seção 2: Tecnologias */}
        <motion.div variants={itemVariants}>
          <Card className={CARD_STYLES.primary}>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Stack Tecnológico</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {SYSTEM_INFO.technologies.map((tech) => (
                  <motion.div
                    key={tech.name}
                    whileHover={{ scale: 1.05 }}
                    className="text-center p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="text-2xl mb-2">{tech.icon}</div>
                    <div className="text-sm font-medium text-slate-700">{tech.name}</div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Seção 3: Funcionalidades */}
        <motion.div variants={itemVariants}>
          <Card className={CARD_STYLES.primary}>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Módulos do Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SYSTEM_INFO.modules.map((module) => {
                  // Map icon names to actual components
                  const iconMap: { [key: string]: React.ComponentType<any> } = {
                    BarChart3,
                    Calendar,
                    Users,
                    CreditCard,
                    Receipt,
                    FileText
                  };
                  
                  const IconComponent = iconMap[module.icon] || BarChart3;
                  
                  return (
                    <motion.div
                      key={module.name}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <IconComponent className={`w-6 h-6 text-${module.color}-600 mb-3`} />
                      <h4 className="font-semibold text-slate-900">{module.name}</h4>
                      <p className="text-sm text-slate-600">{module.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Seção 4: Contato do Desenvolvedor */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Contato do Desenvolvedor</h3>
                  <p className="text-slate-600 mb-4">
                    Este sistema foi desenvolvido por <strong>{SYSTEM_INFO.developer}</strong>. Para suporte técnico, 
                    sugestões de melhorias ou novas funcionalidades, entre em contato através dos 
                    canais disponíveis.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2 hover:bg-blue-50"
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2 hover:bg-blue-50"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-2 hover:bg-blue-50"
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Seção 5: Estatísticas do Projeto */}
        <motion.div variants={itemVariants}>
          <Card className={CARD_STYLES.primary}>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">Estatísticas do Projeto</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">100%</div>
                  <div className="text-sm text-slate-600">TypeScript</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">6</div>
                  <div className="text-sm text-slate-600">Módulos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">8</div>
                  <div className="text-sm text-slate-600">Tecnologias</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-1">∞</div>
                  <div className="text-sm text-slate-600">Possibilidades</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}