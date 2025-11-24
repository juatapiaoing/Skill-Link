import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getServiceDetails, getPerfilUsuario } from "@/services/api";
import { hasClientRequestedService } from "@/services/clientApi";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, User, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ContactModal from "@/components/ContactModal";

const ServiceDetails = () => {
    const { id } = useParams<{ id: string }>();
    console.log("ServiceDetails ID:", id);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [contactModalOpen, setContactModalOpen] = useState(false);

    const { data: service, isLoading, error } = useQuery({
        queryKey: ['service', id],
        queryFn: () => getServiceDetails(id!),
        enabled: !!id
    });

    const { data: userProfile } = useQuery({
        queryKey: ['userProfile', user?.email],
        queryFn: () => user?.email ? getPerfilUsuario(user.email) : null,
        enabled: !!user?.email
    });

    const { data: hasRequested = false } = useQuery({
        queryKey: ['hasRequested', userProfile?.id, service?.id],
        queryFn: () => hasClientRequestedService(userProfile!.id, service!.id),
        enabled: !!userProfile?.id && !!service?.id && userProfile?.tipo === 'Cliente'
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !service) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 flex flex-col items-center justify-center gap-4">
                    <p className="text-muted-foreground">Servicio no encontrado.</p>
                    <Button onClick={() => navigate("/categorias")}>Volver a Categorías</Button>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Navbar />

            <main className="flex-1 py-12">
                <div className="container mx-auto px-4">
                    <Button
                        variant="ghost"
                        className="mb-6 pl-0 hover:pl-2 transition-all"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver
                    </Button>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-6">
                            <Card className="overflow-hidden border-primary/20 shadow-lg">
                                <CardHeader className="bg-primary/5 pb-8">
                                    <div className="flex justify-between items-start">
                                        <Badge className="mb-4 text-sm px-3 py-1">{service.categoria}</Badge>
                                        <span className="text-2xl font-bold text-primary flex items-center">
                                            {service.precio}
                                        </span>
                                    </div>
                                    <CardTitle className="text-3xl md:text-4xl font-bold text-foreground">
                                        {service.titulo}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-8 space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">Descripción del Servicio</h3>
                                        <p className="text-muted-foreground leading-relaxed text-lg">
                                            {service.descripcion}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar / Worker Info */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Información del Profesional</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="bg-primary/10 p-3 rounded-full">
                                            <User className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-lg">{service.trabajadorNombre}</p>
                                            <p className="text-sm text-muted-foreground">Profesional Verificado</p>
                                        </div>
                                    </div>

                                    {service.trabajadorId ? (
                                        <>
                                            <Button
                                                className="w-full mb-3"
                                                onClick={() => navigate(`/profesional/${service.trabajadorId}`)}
                                            >
                                                Ver Perfil Completo
                                            </Button>
                                            {user && userProfile?.tipo === 'Cliente' && (
                                                <Button
                                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                                    onClick={() => setContactModalOpen(true)}
                                                    disabled={hasRequested}
                                                >
                                                    {hasRequested ? 'Ya solicitaste este servicio' : 'Contactar Profesional'}
                                                </Button>
                                            )}
                                            {!user && (
                                                <Button
                                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                                                    onClick={() => navigate('/login')}
                                                >
                                                    Inicia sesión para contactar
                                                </Button>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center italic">
                                            Información del profesional no disponible
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-primary/5 border-primary/10">
                                <CardContent className="pt-6">
                                    <h3 className="font-semibold mb-2">Garantía SkillLink</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Todos los servicios contratados a través de nuestra plataforma cuentan con garantía de satisfacción.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Contact Modal */}
            {service && userProfile && (
                <ContactModal
                    isOpen={contactModalOpen}
                    onClose={() => setContactModalOpen(false)}
                    servicioId={service.id}
                    servicioNombre={service.titulo}
                    trabajadorId={service.trabajadorId}
                    trabajadorNombre={service.trabajadorNombre}
                    clienteId={userProfile.id}
                />
            )}
        </div>
    );
};

export default ServiceDetails;
