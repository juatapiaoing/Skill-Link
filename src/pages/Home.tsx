import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, Search, PlusCircle, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary via-primary-hover to-primary py-20 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <Briefcase className="h-20 w-20" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Bienvenido a SkillLink
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90">
                La plataforma que conecta profesionales con oportunidades laborales en Chile
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/categorias">
                  <Button size="lg" variant="secondary" className="text-lg px-8 py-6 w-full sm:w-auto">
                    <Search className="mr-2 h-5 w-5" />
                    Ver Servicios
                  </Button>
                </Link>
                <Link to="/publicar">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90 border-white w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Publicar Servicio
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-foreground">
                La Problemática
              </h2>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-8">
                <p className="text-lg text-foreground/80 leading-relaxed">
                  En Chile, la tasa de desempleo ha aumentado significativamente, dificultando que 
                  profesionales calificados y trabajadores independientes puedan mostrar sus habilidades 
                  y conectar con potenciales clientes o empleadores. Muchos talentos quedan invisibilizados 
                  por falta de plataformas accesibles y especializadas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
                Nuestra Solución
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <PlusCircle className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">Publica Servicios</h3>
                  <p className="text-muted-foreground">
                    Muestra tus habilidades profesionales y ofrece tus servicios a potenciales clientes
                  </p>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">Busca por Categoría</h3>
                  <p className="text-muted-foreground">
                    Encuentra profesionales especializados en fitness, programación, diseño y más
                  </p>
                </div>
                
                <div className="bg-card border border-border rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">Perfil Profesional</h3>
                  <p className="text-muted-foreground">
                    Crea tu perfil con certificaciones, experiencia y portafolio para destacar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                ¿Listo para Conectar con Oportunidades?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Únete a SkillLink y comienza a ofrecer tus servicios profesionales hoy mismo
              </p>
              <Link to="/perfil">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  Ver Mi Perfil
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
