import { supabase } from '../lib/supabase';
import { Servicio, Persona, Categoria, Certificacion, Curriculum } from '../lib/mockData';

// ============================================
// CLIENT-SPECIFIC FUNCTIONS
// ============================================

export interface SolicitudServicio {
    id: number;
    servicioId: number;
    servicioNombre: string;
    trabajadorId: number;
    trabajadorNombre: string;
    mensaje: string;
    estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'FINALIZADA' | 'CANCELADA';
    fechaCreacion: string;
}

/**
 * Contact a worker for a service
 */
export const contactWorker = async (data: {
    servicioId: number;
    trabajadorId: number;
    clienteId: number;
    mensaje: string;
}) => {
    const { error } = await supabase
        .from('solicitud_servicio')
        .insert([{
            id_servicio: data.servicioId,
            id_cliente: data.clienteId,
            id_trabajador: data.trabajadorId,
            mensaje: data.mensaje,
            estado: 'PENDIENTE'
        }]);

    if (error) throw new Error(`Error creating request: ${error.message}`);
    return true;
};

/**
 * Get all requests made by a client
 */
export const getClientRequests = async (clienteId: number): Promise<SolicitudServicio[]> => {
    const { data, error } = await supabase
        .from('solicitud_servicio')
        .select(`
            id_solicitud,
            id_servicio,
            id_trabajador,
            mensaje,
            estado,
            fecha_creacion,
            servicio:id_servicio (
                nombre_servicio
            )
        `)
        .eq('id_cliente', clienteId)
        .order('fecha_creacion', { ascending: false });

    if (error) {
        console.error("Error fetching client requests:", error);
        return [];
    }

    // Fetch trabajador names separately
    const requestsWithWorkerNames = await Promise.all(
        (data || []).map(async (req: any) => {
            const { data: personaData } = await supabase
                .from('persona')
                .select('p_nombre, ap_paterno')
                .eq('id_persona', req.id_trabajador)
                .single();

            return {
                id: req.id_solicitud,
                servicioId: req.id_servicio,
                servicioNombre: req.servicio?.nombre_servicio || "Servicio",
                trabajadorId: req.id_trabajador,
                trabajadorNombre: personaData
                    ? `${personaData.p_nombre} ${personaData.ap_paterno}`
                    : "Trabajador",
                mensaje: req.mensaje,
                estado: req.estado,
                fechaCreacion: req.fecha_creacion
            };
        })
    );

    return requestsWithWorkerNames;
};

/**
 * Cancel a pending request
 */
export const cancelRequest = async (solicitudId: number) => {
    const { error } = await supabase
        .from('solicitud_servicio')
        .update({ estado: 'CANCELADA' })
        .eq('id_solicitud', solicitudId)
        .eq('estado', 'PENDIENTE'); // Only cancel if still pending

    if (error) throw new Error(`Error canceling request: ${error.message}`);
    return true;
};

/**
 * Update client profile information
 */
export const updateClientProfile = async (
    clienteId: number,
    updates: {
        nombre?: string;
        telefono?: string;
    }
) => {
    const updateData: any = {};

    if (updates.nombre) {
        const [firstName, ...lastNameParts] = updates.nombre.split(' ');
        updateData.p_nombre = firstName;
        updateData.ap_paterno = lastNameParts.join(' ') || firstName;
    }

    if (updates.telefono) {
        updateData.telefono = updates.telefono;
    }

    const { error } = await supabase
        .from('persona')
        .update(updateData)
        .eq('id_persona', clienteId);

    if (error) throw new Error(`Error updating profile: ${error.message}`);
    return true;
};

/**
 * Check if client has already requested a specific service
 */
export const hasClientRequestedService = async (
    clienteId: number,
    servicioId: number
): Promise<boolean> => {
    const { data, error } = await supabase
        .from('solicitud_servicio')
        .select('id_solicitud')
        .eq('id_cliente', clienteId)
        .eq('id_servicio', servicioId)
        .in('estado', ['PENDIENTE', 'ACEPTADA'])
        .maybeSingle();

    if (error) {
        console.error("Error checking service request:", error);
        return false;
    }

    return !!data;
};

/**
 * Get count of unread notifications
 * For clients: requests with status changed (not PENDIENTE)
 * For workers: new pending requests
 */
export const getUnreadNotifications = async (
    userId: number,
    userType: 'Cliente' | 'Trabajador'
): Promise<number> => {
    if (userType === 'Cliente') {
        // For clients: count requests with responses (ACEPTADA, RECHAZADA, FINALIZADA)
        const { count, error } = await supabase
            .from('solicitud_servicio')
            .select('*', { count: 'exact', head: true })
            .eq('id_cliente', userId)
            .in('estado', ['ACEPTADA', 'RECHAZADA', 'FINALIZADA']);

        if (error) {
            console.error("Error fetching client notifications:", error);
            return 0;
        }

        return count || 0;
    } else {
        // For workers: count pending requests
        const { count, error } = await supabase
            .from('solicitud_servicio')
            .select('*', { count: 'exact', head: true })
            .eq('id_trabajador', userId)
            .eq('estado', 'PENDIENTE');

        if (error) {
            console.error("Error fetching worker notifications:", error);
            return 0;
        }

        return count || 0;
    }
};

