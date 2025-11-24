import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { contactWorker } from "@/services/clientApi";
import { useToast } from "@/hooks/use-toast";

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    servicioId: number;
    servicioNombre: string;
    trabajadorId: number;
    trabajadorNombre: string;
    clienteId: number;
}

export default function ContactModal({
    isOpen,
    onClose,
    servicioId,
    servicioNombre,
    trabajadorId,
    trabajadorNombre,
    clienteId
}: ContactModalProps) {
    const [mensaje, setMensaje] = useState("");
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const contactMutation = useMutation({
        mutationFn: contactWorker,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientRequests'] });
            toast({
                title: "Solicitud enviada",
                description: `Tu solicitud ha sido enviada a ${trabajadorNombre}`,
            });
            setMensaje("");
            onClose();
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!mensaje.trim()) {
            toast({
                title: "Error",
                description: "Por favor escribe un mensaje",
                variant: "destructive",
            });
            return;
        }

        contactMutation.mutate({
            servicioId,
            trabajadorId,
            clienteId,
            mensaje: mensaje.trim()
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Contactar Trabajador</DialogTitle>
                    <DialogDescription>
                        Envía una solicitud para el servicio: <strong>{servicioNombre}</strong>
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Trabajador</Label>
                            <div className="p-3 bg-gray-50 rounded-md">
                                <p className="font-medium">{trabajadorNombre}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mensaje">
                                Mensaje <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="mensaje"
                                placeholder="Describe tu necesidad, presupuesto estimado, fechas disponibles, etc."
                                value={mensaje}
                                onChange={(e) => setMensaje(e.target.value)}
                                rows={5}
                                required
                            />
                            <p className="text-sm text-muted-foreground">
                                Sé claro y específico sobre lo que necesitas
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={contactMutation.isPending}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={contactMutation.isPending || !mensaje.trim()}
                        >
                            {contactMutation.isPending ? "Enviando..." : "Enviar Solicitud"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
