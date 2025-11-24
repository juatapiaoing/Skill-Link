import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getPerfilUsuario } from "@/services/api";
import { getClientRequests } from "@/services/clientApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ClientProfile() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);

    const { data: userProfile, isLoading } = useQuery({
        queryKey: ['userProfile', user?.email],
        queryFn: () => user?.email ? getPerfilUsuario(user.email) : null,
        enabled: !!user?.email
    });

    const { data: recentRequests = [] } = useQuery({
        queryKey: ['clientRequests', userProfile?.id],
        queryFn: () => userProfile?.id ? getClientRequests(userProfile.id) : [],
        enabled: !!userProfile?.id
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Cargando perfil...</p>
                </div>
            </div>
        );
    }

    if (!userProfile || userProfile.tipo !== 'Cliente') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6 text-center">
                        <p className="text-muted-foreground">No tienes acceso a esta página</p>
                        <Button onClick={() => navigate('/')} className="mt-4">
                            Volver al Inicio
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const getEstadoBadge = (estado: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'PENDIENTE': 'secondary',
            'ACEPTADA': 'default',
            'RECHAZADA': 'destructive',
            'FINALIZADA': 'outline',
            'CANCELADA': 'outline'
        };
        return <Badge variant={variants[estado] || 'default'}>{estado}</Badge>;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Card */}
                <Card className="border-none shadow-lg">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-6">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                {userProfile.nombre.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900">{userProfile.nombre}</h1>
                                <p className="text-lg text-gray-600 mt-1">Cliente</p>
                                <div className="flex flex-wrap gap-4 mt-4">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail className="w-4 h-4" />
                                        <span>{userProfile.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <span>{userProfile.comuna}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Requests */}
                <Card className="border-none shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Solicitudes Recientes</CardTitle>
                        <Button
                            variant="outline"
                            onClick={() => navigate('/mis-solicitudes')}
                        >
                            Ver Todas
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {recentRequests.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No has enviado solicitudes aún</p>
                                <Button
                                    onClick={() => navigate('/categorias')}
                                    className="mt-4"
                                >
                                    Explorar Servicios
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentRequests.slice(0, 5).map((request) => (
                                    <div
                                        key={request.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">
                                                {request.servicioNombre}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Trabajador: {request.trabajadorNombre}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(request.fechaCreacion).toLocaleDateString('es-CL')}
                                            </div>
                                        </div>
                                        <div>
                                            {getEstadoBadge(request.estado)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-none shadow-lg">
                    <CardHeader>
                        <CardTitle>Acciones Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                className="h-auto py-4 flex flex-col items-center gap-2"
                                onClick={() => navigate('/categorias')}
                            >
                                <span className="text-2xl">🔍</span>
                                <span>Buscar Servicios</span>
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto py-4 flex flex-col items-center gap-2"
                                onClick={() => navigate('/mis-solicitudes')}
                            >
                                <span className="text-2xl">📋</span>
                                <span>Mis Solicitudes</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
