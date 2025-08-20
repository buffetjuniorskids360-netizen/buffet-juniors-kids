import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Sparkles, Heart, Gift } from 'lucide-react';
import { 
  pageVariants, 
  containerVariants, 
  itemVariants,
  cardHoverVariants,
  createResponsiveVariants,
  mobileOptimizedVariants
} from '@/lib/animations';
import { useAnimationConfig } from '@/hooks/useIsMobile';

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export default function HeroSection({ onGetStarted }: HeroSectionProps) {
  const { isMobile, prefersReducedMotion, duration } = useAnimationConfig();

  // Mobile-optimized decorative animations
  const decorativeAnimation = prefersReducedMotion ? {} : {
    rotate: isMobile ? 180 : 360,
    scale: isMobile ? [1, 1.05, 1] : [1, 1.1, 1],
  };

  const decorativeTransition = {
    duration: prefersReducedMotion ? 0 : isMobile ? 30 : 20,
    repeat: prefersReducedMotion ? 0 : Infinity,
    ease: "linear"
  };

  return (
    <motion.section
      variants={createResponsiveVariants(pageVariants)}
      initial="initial"
      animate="animate"
      className="relative min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden"
    >
      {/* Decorative Elements - Reduced on mobile for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={decorativeAnimation}
          transition={decorativeTransition}
          className={`absolute -top-40 -right-40 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl ${
            isMobile ? 'w-60 h-60' : 'w-80 h-80'
          }`}
        />
        <motion.div
          animate={{
            ...decorativeAnimation,
            rotate: prefersReducedMotion ? 0 : isMobile ? -180 : -360,
            scale: isMobile ? [1, 1.1, 1] : [1, 1.2, 1],
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : isMobile ? 35 : 25,
            repeat: prefersReducedMotion ? 0 : Infinity,
            ease: "linear"
          }}
          className={`absolute -bottom-40 -left-40 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl ${
            isMobile ? 'w-72 h-72' : 'w-96 h-96'
          }`}
        />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16">
        <motion.div
          variants={containerVariants}
          className="grid lg:grid-cols-2 gap-16 items-center min-h-screen"
        >
          {/* Content */}
          <motion.div variants={itemVariants} className="space-y-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                transition: { 
                  delay: prefersReducedMotion ? 0 : 0.2, 
                  duration: prefersReducedMotion ? 0.01 : duration.medium 
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full text-purple-700 text-sm font-medium"
            >
              <Sparkles className="w-4 h-4" />
              Sistema Completo para Buffets Infantis
            </motion.div>

            <motion.h1 
              variants={createResponsiveVariants(itemVariants)}
              className={`font-bold text-gray-900 leading-tight ${
                isMobile ? 'text-4xl' : 'text-5xl lg:text-7xl'
              }`}
            >
              Festas Inesquecíveis
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent block">
                Começam Aqui
              </span>
            </motion.h1>

            <motion.p 
              variants={createResponsiveVariants(itemVariants)}
              className={`text-gray-600 leading-relaxed max-w-lg ${
                isMobile ? 'text-lg' : 'text-xl'
              }`}
            >
              Gerencie clientes, eventos e finanças do seu buffet infantil com 
              facilidade. Transforme sonhos em realidade com nossa plataforma completa.
            </motion.p>

            <motion.div 
              variants={createResponsiveVariants(itemVariants)}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.div variants={mobileOptimizedVariants} whileTap="tap" whileHover="hover">
                <Button 
                  size={isMobile ? "default" : "lg"}
                  onClick={onGetStarted}
                  className={`group bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all ${
                    isMobile ? 'px-6 py-3 text-base' : 'px-8 py-4 text-lg'
                  } ${prefersReducedMotion ? 'duration-75' : 'duration-300'}`}
                >
                  Começar Agora
                  <ArrowRight className={`ml-2 group-hover:translate-x-1 transition-transform ${
                    isMobile ? 'w-4 h-4' : 'w-5 h-5'
                  } ${prefersReducedMotion ? 'group-hover:translate-x-0' : ''}`} />
                </Button>
              </motion.div>
              
              <motion.div variants={mobileOptimizedVariants} whileTap="tap" whileHover="hover">
                <Button 
                  variant="outline" 
                  size={isMobile ? "default" : "lg"}
                  className={`rounded-2xl border-2 hover:bg-white/80 backdrop-blur-sm ${
                    isMobile ? 'px-6 py-3 text-base' : 'px-8 py-4 text-lg'
                  }`}
                >
                  Ver Demonstração
                </Button>
              </motion.div>
            </motion.div>

            {/* Features */}
            <motion.div 
              variants={createResponsiveVariants(containerVariants)}
              className={`grid gap-4 pt-8 ${
                isMobile ? 'grid-cols-1 space-y-2' : 'grid-cols-3'
              }`}
            >
              {[
                { icon: Heart, text: "Feito com Amor", color: "text-pink-500" },
                { icon: Sparkles, text: "Fácil de Usar", color: "text-purple-500" },
                { icon: Gift, text: "Resultados Incríveis", color: "text-blue-500" }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={createResponsiveVariants(itemVariants)}
                  className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}
                >
                  <div className={`rounded-lg bg-white/50 ${feature.color} ${
                    isMobile ? 'p-1.5' : 'p-2'
                  }`}>
                    <feature.icon className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
                  </div>
                  <span className={`font-medium text-gray-700 ${
                    isMobile ? 'text-xs' : 'text-sm'
                  }`}>
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div variants={createResponsiveVariants(itemVariants)} className="relative">
            <motion.div
              variants={createResponsiveVariants(cardHoverVariants)}
              whileHover={prefersReducedMotion ? "rest" : "hover"}
              className="relative"
            >
              <Card className="overflow-hidden shadow-2xl rounded-3xl bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm border-0">
                <CardContent className="p-0">
                  {/* Beautiful Birthday Cake Image */}
                  <div className={`relative bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center ${
                    isMobile ? 'h-64' : 'h-96 lg:h-[500px]'
                  }`}>
                    {/* Cake Illustration */}
                    <motion.div 
                      className="relative"
                      animate={prefersReducedMotion ? {} : {
                        y: isMobile ? [0, -5, 0] : [0, -10, 0],
                        rotate: isMobile ? [0, 1, -1, 0] : [0, 2, -2, 0]
                      }}
                      transition={{
                        duration: prefersReducedMotion ? 0 : isMobile ? 6 : 4,
                        repeat: prefersReducedMotion ? 0 : Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {/* Cake Base */}
                      <div className={`bg-gradient-to-t from-pink-300 to-pink-200 rounded-lg relative shadow-lg ${
                        isMobile ? 'w-32 h-20' : 'w-48 h-32'
                      }`}>
                        {/* Frosting */}
                        <div className={`absolute left-4 right-4 bg-gradient-to-t from-white to-pink-50 rounded-full shadow-md ${
                          isMobile ? '-top-2 h-4' : '-top-4 h-8'
                        }`}></div>
                        
                        {/* Candles */}
                        <div className={`absolute left-1/2 transform -translate-x-1/2 flex ${
                          isMobile ? '-top-6 gap-2' : '-top-12 gap-4'
                        }`}>
                          {[...Array(isMobile ? 3 : 5)].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: prefersReducedMotion ? 1 : 1 }}
                              transition={{ 
                                delay: prefersReducedMotion ? 0 : 0.5 + i * 0.1,
                                duration: prefersReducedMotion ? 0.01 : 0.3
                              }}
                              className="relative"
                            >
                              <div className={`bg-gradient-to-t from-yellow-300 to-yellow-200 rounded-full ${
                                isMobile ? 'w-1.5 h-4' : 'w-2 h-8'
                              }`}></div>
                              <motion.div
                                animate={prefersReducedMotion ? {} : {
                                  scale: [1, 1.2, 1],
                                  opacity: [0.8, 1, 0.8]
                                }}
                                transition={{
                                  duration: prefersReducedMotion ? 0 : 1,
                                  repeat: prefersReducedMotion ? 0 : Infinity,
                                  delay: prefersReducedMotion ? 0 : i * 0.2
                                }}
                                className={`absolute left-1/2 transform -translate-x-1/2 bg-gradient-to-t from-orange-400 to-yellow-300 rounded-full shadow-lg ${
                                  isMobile ? '-top-1 w-2 h-2' : '-top-2 w-3 h-3'
                                }`}
                              ></motion.div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Decorative Elements */}
                        <div className={`absolute flex justify-between ${
                          isMobile ? 'inset-x-2 top-2' : 'inset-x-4 top-4'
                        }`}>
                          {[...Array(isMobile ? 2 : 3)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={prefersReducedMotion ? {} : { rotate: 360 }}
                              transition={{
                                duration: prefersReducedMotion ? 0 : 3,
                                repeat: prefersReducedMotion ? 0 : Infinity,
                                delay: prefersReducedMotion ? 0 : i * 0.5
                              }}
                              className={`bg-gradient-to-br from-purple-300 to-blue-300 rounded-full shadow-md ${
                                isMobile ? 'w-4 h-4' : 'w-6 h-6'
                              }`}
                            ></motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>

                    {/* Floating Sparkles - Reduced on mobile for performance */}
                    {[...Array(isMobile ? 4 : 8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`absolute bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full ${
                          isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'
                        }`}
                        style={{
                          left: `${20 + Math.random() * 60}%`,
                          top: `${20 + Math.random() * 60}%`,
                        }}
                        animate={prefersReducedMotion ? {} : {
                          y: isMobile ? [0, -10, 0] : [0, -20, 0],
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                        }}
                        transition={{
                          duration: prefersReducedMotion ? 0 : 2 + Math.random() * 2,
                          repeat: prefersReducedMotion ? 0 : Infinity,
                          delay: prefersReducedMotion ? 0 : Math.random() * 2,
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Floating Stats - Hidden on mobile for cleaner layout */}
            {!isMobile && (
              <>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: prefersReducedMotion ? 0 : 1, 
                    duration: prefersReducedMotion ? 0.01 : duration.medium 
                  }}
                  className="absolute -bottom-8 -left-8 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">500+</div>
                    <div className="text-sm text-gray-600">Festas Realizadas</div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: prefersReducedMotion ? 0 : 1.2, 
                    duration: prefersReducedMotion ? 0.01 : duration.medium 
                  }}
                  className="absolute -top-8 -right-8 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">98%</div>
                    <div className="text-sm text-gray-600">Satisfação</div>
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}