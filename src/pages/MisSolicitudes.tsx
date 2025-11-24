import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getPerfilUsuario } from "@/services/api";
import { getClientRequests, cancelRequest } from "@/services/clientApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function MisSolicitudes() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [estadoFilter, setEstadoFilter] = useState("all");

    const { data: userProfile } = useQuery({
        queryKey: ['userProfile', user?.email],
        queryFn: () => user?.email ? getPerfilUsuario(user.email) : null,
        enabled: !!user?.email
    });

    const { data: requests = [], isLoading } = useQuery({
        queryKey: ['clientRequests', userProfile?.id],
        queryFn: () => userProfile?.id ? getClientRequests(userProfile.id) : [],
        enabled: !!userProfile?.id
    });

    const cancelMutation = useMutation({
        mutationFn: cancelRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientRequests'] });
            toast({
                title: "Solicitud cancelada",
                description: "La solicitud ha sido cancelada exitosamente",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    });

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

    const filteredRequests = requests.filter(req => {
        const matchesSearch = searchQuery === "" ||
            req.servicioNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.trabajadorNombre.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesEstado = estadoFilter === "all" || req.estado === estadoFilter;

        return matchesSearch && matchesEstado;
    });

    const getEstadoBadge = (estado: string) => {
        const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
            'PENDIENTE': { variant: 'secondary', label: 'Pendiente' },
            'ACEPTADA': { variant: 'default', label: 'Aceptada' },
            'RECHAZADA': { variant: 'destructive', label: 'Rechazada' },
            'FINALIZADA': { variant: 'outline', label: 'Finalizada' },
            'CANCELADA': { variant: 'outline', label: 'Cancelada' }
        };
        const { variant, label } = config[estado] || { variant: 'default', label: estado };
        return <Badge variant={variant}>{label}</Badge>;
    };

    const handleCancel = (solicitudId: number) => {
        if (confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) {
            cancelMutation.mutate(solicitudId);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Mis Solicitudes</h1>
                    <p className="text-gray-600 mt-2">Gestiona todas tus solicitudes de servicio</p>
                </div>

                {/* Filters */}
                <Card className="mb-6 border-none shadow-lg">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Buscar por servicio o trabajador..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                                <SelectTrigger className="w-full md:w-48">
                                    <SelectValue placeholder="Filtrar por estado" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos los estados</SelectItem>
                                    <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                                    <SelectItem value="ACEPTADA">Aceptada</SelectItem>
                                    <SelectItem value="RECHAZADA">Rechazada</SelectItem>
                                    <SelectItem value="FINALIZADA">Finalizada</SelectItem>
                                    <SelectItem value="CANCELADA">Cancelada</SelectItem>
                                </SelectContent>
                            </Select>
                            {(searchQuery || estadoFilter !== "all") && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setEstadoFilter("all");
                                    }}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Limpiar
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Requests List */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Cargando solicitudes...</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <Card className="border-none shadow-lg">
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground mb-4">
                                {requests.length === 0
                                    ? "No has enviado solicitudes aún"
                                    : "No se encontraron solicitudes con los filtros aplicados"}
                            </p>
                            <Button onClick={() => navigate('/categorias')}>
                                Explorar Servicios
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {filteredRequests.map((request) => (
                            <Card key={request.id} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    {request.servicioNombre}
                                                </h3>
                                                {getEstadoBadge(request.estado)}
                                            </div>
                                            <p className="text-gray-600 mb-2">
                                                <span className="font-medium">Trabajador:</span> {request.trabajadorNombre}
                                            </p>
                                            <p className="text-sm text-gray-500 mb-3">
                                                <span className="font-medium">Mensaje:</span> {request.mensaje}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(request.fechaCreacion).toLocaleDateString('es-CL', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {request.estado === 'PENDIENTE' && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleCancel(request.id)}
                                                    disabled={cancelMutation.isPending}
                                                >
                                                    Cancelar Solicitud
                                                </Button>
                                            )}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/servicio/${request.servicioId}`)}
                                            >
                                                Ver Servicio
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
