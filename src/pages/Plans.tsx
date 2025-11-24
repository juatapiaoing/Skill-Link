import { useEffect, useState } from "react";
import { getPlanes, subscribeToPlan, getPerfilUsuario, getCurrentMembership } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Check, Loader2, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Plans = () => {
    const [planes, setPlanes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState<number | null>(null);
    const [currentMembership, setCurrentMembership] = useState<any | null>(null);
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const loadPlanes = async () => {
            try {
                const data = await getPlanes();
                setPlanes(data || []);

                // Load current membership if user is logged in
                if (user?.email) {
                    const profile = await getPerfilUsuario(user.email);
                    if (profile) {
                        const membership = await getCurrentMembership(profile.id);
                        setCurrentMembership(membership);
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadPlanes();
    }, [user]);

    const handleSubscribe = async (planId: number, planName: string) => {
        if (!user) {
            toast({
                title: "Inicia sesión",
                description: "Debes iniciar sesión para suscribirte.",
                variant: "destructive"
            });
            navigate("/login");
            return;
        }

        setSubscribing(planId);
        try {
            const profile = await getPerfilUsuario(user.email || "");
            if (!profile) throw new Error("Perfil no encontrado");

            // Mock payment delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            await subscribeToPlan(profile.id, planId);

            toast({
                title: "¡Suscripción Exitosa!",
                description: `Te has suscrito al plan ${planName}.`,
            });
            // Refresh membership data
            const membership = await getCurrentMembership(profile.id);
            setCurrentMembership(membership);
            // Redirect to home instead of /publicar
            navigate("/");
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "No se pudo procesar la suscripción.",
                variant: "destructive"
            });
        } finally {
            setSubscribing(null);
        }
    };

    if (loading) {
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

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4">Elige tu Plan Profesional</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Potencia tu carrera con nuestras herramientas premium. Cancela cuando quieras.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-7xl mx-auto">
                    {planes.map((plan) => {
                        const isBlack = plan.nombre === "Black";
                        const isPopular = plan.nombre === "Oro";

                        return (
                            <Card
                                key={plan.id_plan}
                                className={`flex flex-col relative ${isBlack ? "bg-slate-900 text-white border-slate-800" :
                                    isPopular ? "border-primary shadow-lg scale-105 z-10" : ""
                                    }`}
                            >
                                {isPopular && (
                                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                        <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                                            Más Popular
                                        </span>
                                    </div>
                                )}
                                {currentMembership && (currentMembership.plan as any)?.id_plan === plan.id_plan && (
                                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                        <Badge className="bg-indigo-600 text-white">
                                            Plan Actual
                                        </Badge>
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="text-2xl">{plan.nombre}</CardTitle>
                                    <CardDescription className={isBlack ? "text-slate-400" : ""}>
                                        {plan.descripcion}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold">
                                            ${parseInt(plan.precio).toLocaleString('es-CL')}
                                        </span>
                                        <span className={`text-sm ${isBlack ? "text-slate-400" : "text-muted-foreground"}`}>
                                            /mes
                                        </span>
                                    </div>
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500" />
                                            {plan.max_publicaciones === -1 ? "Publicaciones Ilimitadas" : `${plan.max_publicaciones} Publicación(es)`}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500" />
                                            Duración: {plan.duracion_publicacion_dias} días
                                        </li>
                                        {isBlack && (
                                            <li className="flex items-center gap-2 font-semibold text-yellow-500">
                                                <Star className="h-4 w-4 fill-current" />
                                                Insignia Verificado
                                            </li>
                                        )}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className={`w-full ${isBlack ? "bg-white text-slate-900 hover:bg-slate-200" : ""}`}
                                        variant={isBlack ? "secondary" : isPopular ? "default" : "outline"}
                                        onClick={() => handleSubscribe(plan.id_plan, plan.nombre)}
                                        disabled={subscribing === plan.id_plan || (currentMembership && (currentMembership.plan as any)?.id_plan === plan.id_plan)}
                                    >
                                        {subscribing === plan.id_plan ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : currentMembership && (currentMembership.plan as any)?.id_plan === plan.id_plan ? (
                                            "Plan Actual"
                                        ) : (
                                            "Suscribirse"
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Plans;
