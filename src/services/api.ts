import { supabase } from '../lib/supabase';
import { Servicio, Persona, Categoria, Certificacion, Curriculum } from '../lib/mockData';

export const getServicios = async (): Promise<Servicio[]> => {
    const { data, error } = await supabase
        .from('servicio')
        .select(`
            id_servicio,
            nombre_servicio,
            descripcion,
            precio,
            servicio_categoria_servicio (
                categoria_servicio (
                    nombre_categ_serv
                )
            )
        `);

    if (error) throw new Error(error.message);

    return (data || []).map((s: any) => {
        const categoriaData = s.servicio_categoria_servicio?.[0]?.categoria_servicio;
        const nombreCategoria = categoriaData?.nombre_categ_serv || "General";

        return {
            id: s.id_servicio,
            titulo: s.nombre_servicio,
            categoria: nombreCategoria,
            descripcion: s.descripcion || "",
            precio: s.precio || "A convenir",
            trabajadorId: 0,
            trabajadorNombre: "Disponible"
        };
    });
};

export const getCategorias = async (): Promise<Categoria[]> => {
    const { data, error } = await supabase
        .from('categoria_servicio')
        .select(`
            id_categ_serv,
            nombre_categ_serv,
            servicio_categoria_servicio (count)
        `);

    if (error) throw new Error(error.message);

    return (data || []).map((c: any) => ({
        id: c.id_categ_serv,
        nombre: c.nombre_categ_serv,
        icono: "🔹",
        cantidadServicios: c.servicio_categoria_servicio?.[0]?.count || 0
    }));
};

export const getTrabajadoresDestacados = async (): Promise<Persona[]> => {
    const { data, error } = await supabase
        .from('trabajador')
        .select(`
            id_trabajador,
            id_persona,
            verificado,
            calificacion_promedio,
            total_calificaciones,
            persona:id_persona (
                p_nombre,
                ap_paterno,
                email
            ),
            perfil:perfil!perfil_trab_uk_fk (
                descripcion
            )
        `)
        .order('calificacion_promedio', { ascending: false })
        .order('total_calificaciones', { ascending: false })
        .limit(6);

    if (error) throw new Error(error.message);

    return (data || []).map((t: any) => {
        const persona = t.persona as any;
        const perfil = t.perfil as any[];

        return {
            id: t.id_trabajador,
            nombre: persona ? `${persona.p_nombre} ${persona.ap_paterno}` : "Usuario",
            tipo: "Trabajador",
            comuna: "Santiago",
            email: persona?.email,
            foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
            descripcion: perfil?.[0]?.descripcion || "Profesional registrado en SkillLink",
            verificado: t.verificado || false,
            calificacionPromedio: t.calificacion_promedio || 0,
            totalCalificaciones: t.total_calificaciones || 0
        };
    });
};

export const getCategoriasDestacadas = async (): Promise<Categoria[]> => {
    const { data, error } = await supabase
        .from('categoria_servicio')
        .select('*')
        .limit(6);

    if (error) throw new Error(error.message);

    return (data || []).map((c: any) => ({
        id: c.id_categ_serv,
        nombre: c.nombre_categ_serv,
        icono: "🔹",
        cantidadServicios: 0
    }));
};

export const getPerfilUsuario = async (email: string): Promise<Persona | null> => {
    const { data, error } = await supabase
        .from('persona')
        .select(`
            *,
            trabajador:trabajador(id_trabajador)
        `)
        .eq('email', email)
        .single();

    if (error) {
        console.error("Error fetching user profile:", error);
        return null;
    }

    if (!data) return null;

    // Determine role based on existence of trabajador record
    // Supabase returns an array for one-to-many, or object for one-to-one if specified.
    // Here we assume standard join which returns array usually unless !inner or single is used on the relation.
    // But let's be safe.
    const isTrabajador = data.trabajador && (Array.isArray(data.trabajador) ? data.trabajador.length > 0 : true);

    return {
        id: data.id_persona,
        nombre: `${data.p_nombre} ${data.ap_paterno}`,
        tipo: isTrabajador ? "Trabajador" : "Cliente",
        comuna: data.comuna || "Santiago",
        email: data.email,
        foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
        descripcion: "Usuario de SkillLink"
    };
};

export const getPublicProfile = async (id: string): Promise<Persona | null> => {
    const { data, error } = await supabase
        .from('trabajador')
        .select(`
            id_trabajador,
            persona:id_persona (
                p_nombre,
                ap_paterno,
                email
            ),
            perfil:perfil!perfil_trab_uk_fk (
                descripcion,
                banner_url,
                color_tema
            )
        `)
        .eq('id_trabajador', id)
        .single();

    if (error) {
        console.error(`Error fetching public profile for ID ${id}:`, error.message, error.details, error.hint);
        return null;
    }

    if (!data) return null;

    const workerData = data as any;
    const persona = workerData.persona;
    const perfil = workerData.perfil as any[];

    // Fetch services
    const { data: servicesData } = await supabase
        .from('trabajador_servicio')
        .select(`
            servicio:servicio_id_servicio (
                id_servicio,
                nombre_servicio,
                descripcion,
                precio,
                servicio_categoria_servicio (
                    categoria_servicio (
                        nombre_categ_serv
                    )
                )
            )
        `)
        .eq('trabajador_id_persona', workerData.id_trabajador);

    const services = (servicesData || []).map((item: any) => {
        const s = item.servicio;
        const categoriaData = s.servicio_categoria_servicio?.[0]?.categoria_servicio;
        return {
            id: s.id_servicio,
            titulo: s.nombre_servicio,
            categoria: categoriaData?.nombre_categ_serv || "General",
            descripcion: s.descripcion || "",
            precio: s.precio || "A convenir",
            trabajadorId: workerData.id_trabajador
        };
    });

    // Fetch certifications
    const { data: certsData } = await supabase
        .from('trabajador_certificacion')
        .select(`
            certificacion:certificacion_id_certificacion (
                id_certificacion,
                nom_certificado,
                entidad_emisora,
                fecha_emision
            )
        `)
        .eq('trabajador_id_persona', workerData.id_trabajador);

    const certifications = (certsData || []).map((item: any) => ({
        id: item.certificacion.id_certificacion,
        nombre: item.certificacion.nom_certificado,
        entidad: item.certificacion.entidad_emisora,
        año: new Date(item.certificacion.fecha_emision).getFullYear(),
        trabajadorId: workerData.id_trabajador
    }));

    // Fetch experience (Curriculum)
    const { data: cvData } = await supabase
        .from('curriculum')
        .select('*')
        .eq('trabajador_id_trabajador', workerData.id_trabajador);

    const experience = (cvData || []).map((cv: any) => {
        let expList: any[] = [];
        try {
            expList = JSON.parse(cv.experiencia_json);
        } catch (e) {
            console.error("Error parsing experience JSON", e);
        }
        return expList;
    }).flat();

    // Fetch completed jobs count
    const { count: completedJobs } = await supabase
        .from('solicitud_servicio')
        .select('*', { count: 'exact', head: true })
        .eq('id_trabajador', workerData.id_trabajador)
        .eq('estado', 'FINALIZADO');

    return {
        id: workerData.id_trabajador,
        nombre: persona ? `${persona.p_nombre} ${persona.ap_paterno}` : "Usuario",
        tipo: "Trabajador",
        comuna: "Santiago",
        email: persona?.email,
        foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
        descripcion: perfil?.[0]?.descripcion || "Profesional registrado en SkillLink",
        bannerUrl: perfil?.[0]?.banner_url,
        colorTema: perfil?.[0]?.color_tema,
        servicios: services,
        certificaciones: certifications,
        experiencia: experience,
        trabajosCompletados: completedJobs || 0
    };
};

export const updateProfile = async (idPersona: number, updates: Partial<Persona>) => {
    // Update PERSONA table
    const { error: personaError } = await supabase
        .from('persona')
        .update({
            p_nombre: updates.nombre?.split(' ')[0],
            ap_paterno: updates.nombre?.split(' ')[1] || '',
        })
        .eq('id_persona', idPersona);

    if (personaError) throw personaError;
};

export const searchProfessionals = async (query: string, categoryId?: string): Promise<Persona[]> => {
    let queryBuilder = supabase
        .from('trabajador')
        .select(`
            id_trabajador,
            persona:id_persona (
                p_nombre,
                ap_paterno,
                email
            ),
            perfil:perfil!perfil_trab_uk_fk (
                descripcion,
                id_categoria
            )
        `);

    // Filter by category if provided
    if (categoryId && categoryId !== "all") {
        queryBuilder = supabase
            .from('trabajador')
            .select(`
                id_trabajador,
                persona:id_persona (
                    p_nombre,
                    ap_paterno,
                    email
                ),
                perfil:perfil!perfil_trab_uk_fk!inner (
                    descripcion,
                    id_categoria
                )
            `)
            .eq('perfil.id_categoria', categoryId);
    }

    const { data, error } = await queryBuilder;

    if (error) throw new Error(error.message);

    let results = (data || []).map((t: any) => {
        const persona = t.persona as any;
        const perfil = t.perfil as any[];
        const perfilData = Array.isArray(perfil) ? perfil[0] : perfil;

        return {
            id: t.id_trabajador,
            nombre: persona ? `${persona.p_nombre} ${persona.ap_paterno}` : "Usuario",
            tipo: "Trabajador",
            comuna: "Santiago",
            email: persona?.email,
            foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
            descripcion: perfilData?.descripcion || "Profesional registrado en SkillLink"
        };
    });

    // Filter by text query if provided
    if (query) {
        const lowerQuery = query.toLowerCase();
        results = results.filter((p: any) =>
            p.nombre.toLowerCase().includes(lowerQuery) ||
            p.descripcion.toLowerCase().includes(lowerQuery)
        );
    }

    return results as Persona[];
};

export const createService = async (serviceData: {
    titulo: string;
    descripcion: string;
    precio: string;
    categoriaId: number;
    trabajadorId: number;
}) => {
    const idServicio = Math.floor(Math.random() * 1000000);

    // 1. Insert into SERVICIO
    const { error: serviceError } = await supabase
        .from('servicio')
        .insert([{
            id_servicio: idServicio,
            nombre_servicio: serviceData.titulo,
            descripcion: serviceData.descripcion,
            precio: serviceData.precio,
            estado: 'A' // Activo
        }]);

    if (serviceError) throw new Error(`Error creating service: ${serviceError.message}`);

    // 2. Link to Category (SERVICIO_CATEGORIA_SERVICIO)
    const { error: catError } = await supabase
        .from('servicio_categoria_servicio')
        .insert([{
            servicio_id_servicio: idServicio,
            categ_serv_id: serviceData.categoriaId
        }]);

    if (catError) throw new Error(`Error linking category: ${catError.message}`);

    // 3. Link to Worker (TRABAJADOR_SERVICIO)
    // Assuming id_membresia is 1 for now
    const { error: workerError } = await supabase
        .from('trabajador_servicio')
        .insert([{
            trabajador_id_persona: serviceData.trabajadorId,
            trabajador_id_membresia: 1,
            servicio_id_servicio: idServicio
        }]);

    if (workerError) throw new Error(`Error linking worker: ${workerError.message}`);

    return { id: idServicio };
};

export const getServiciosByTrabajador = async (idPersona: number): Promise<Servicio[]> => {
    const { data, error } = await supabase
        .from('trabajador_servicio')
        .select(`
            servicio:servicio_id_servicio (
                id_servicio,
                nombre_servicio,
                descripcion,
                precio,
                servicio_categoria_servicio (
                    categoria_servicio (
                        nombre_categ_serv
                    )
                )
            )
        `)
        .eq('trabajador_id_persona', idPersona);

    if (error) {
        console.error("Error fetching worker services:", error);
        return [];
    }

    return (data || []).map((item: any) => {
        const s = item.servicio;
        const categoriaData = s.servicio_categoria_servicio?.[0]?.categoria_servicio;
        const nombreCategoria = categoriaData?.nombre_categ_serv || "General";

        return {
            id: s.id_servicio,
            titulo: s.nombre_servicio,
            categoria: nombreCategoria,
            descripcion: s.descripcion || "",
            precio: s.precio || "A convenir",
            trabajadorId: idPersona,
            trabajadorNombre: "Yo" // Context dependent, but for profile it's fine
        };
    });
};

export const getServiceDetails = async (id: string): Promise<Servicio | null> => {
    const { data, error } = await supabase
        .from('servicio')
        .select(`
            id_servicio,
            nombre_servicio,
            descripcion,
            precio,
            servicio_categoria_servicio (
                categoria_servicio (
                    nombre_categ_serv
                )
            ),
            trabajador_servicio (
                trabajador_id_persona
            )
        `)
        .eq('id_servicio', id)
        .single();

    if (error) {
        console.error("Error fetching service details:", error);
        return null;
    }

    if (!data) return null;

    const s = data as any;
    const categoriaData = s.servicio_categoria_servicio?.[0]?.categoria_servicio;
    const nombreCategoria = categoriaData?.nombre_categ_serv || "General";

    const trabajadorIdPersona = s.trabajador_servicio?.[0]?.trabajador_id_persona || 0;

    // Fetch worker name and correct trabajador_id
    let trabajadorNombre = "Disponible";
    let realTrabajadorId = 0;

    if (trabajadorIdPersona) {
        const { data: personaData } = await supabase
            .from('persona')
            .select('p_nombre, ap_paterno')
            .eq('id_persona', trabajadorIdPersona)
            .single();

        if (personaData) {
            trabajadorNombre = `${personaData.p_nombre} ${personaData.ap_paterno}`;
        }

        // Get the actual id_trabajador for the profile link
        const { data: trabajadorData } = await supabase
            .from('trabajador')
            .select('id_trabajador')
            .eq('id_persona', trabajadorIdPersona)
            .single();

        if (trabajadorData) {
            realTrabajadorId = trabajadorData.id_trabajador;
        }
    }

    return {
        id: s.id_servicio,
        titulo: s.nombre_servicio,
        categoria: nombreCategoria,
        descripcion: s.descripcion || "",
        precio: s.precio || "A convenir",
        trabajadorId: realTrabajadorId, // Now returns the correct id_trabajador
        trabajadorNombre: trabajadorNombre
    };
};

export const createSolicitud = async (data: {
    servicioId: number;
    clienteId: number;
    trabajadorId: number;
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

export const getSolicitudes = async (userId: number) => {
    // Fetch requests where user is client OR worker
    const { data, error } = await supabase
        .from('solicitud_servicio')
        .select(`
            id_solicitud,
            mensaje,
            estado,
            fecha_creacion,
            cliente:id_cliente (
                p_nombre,
                ap_paterno
            ),
            trabajador:id_trabajador (
                p_nombre,
                ap_paterno
            ),
            servicio:id_servicio (
                nombre_servicio
            )
        `)
        .or(`id_cliente.eq.${userId},id_trabajador.eq.${userId}`)
        .order('fecha_creacion', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
};

export const getMensajes = async (solicitudId: number) => {
    const { data, error } = await supabase
        .from('mensaje')
        .select(`
            id_mensaje,
            id_remitente,
            contenido,
            fecha_envio,
            remitente:id_remitente (
                p_nombre,
                ap_paterno
            )
        `)
        .eq('id_solicitud', solicitudId)
        .order('fecha_envio', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
};

export const enviarMensaje = async (solicitudId: number, remitenteId: number, contenido: string) => {
    const { error } = await supabase
        .from('mensaje')
        .insert([{
            id_solicitud: solicitudId,
            id_remitente: remitenteId,
            contenido: contenido
        }]);

    if (error) throw new Error(error.message);
    return true;
};

// --- Subscription & Rating System ---

export const getPlanes = async () => {
    const { data, error } = await supabase
        .from('plan')
        .select('*')
        .order('precio', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
};

export const subscribeToPlan = async (userId: number, planId: number) => {
    // 1. Deactivate current active membership if any
    await supabase
        .from('membresia')
        .update({ estado: 'CANCELADA' })
        .eq('id_usuario', userId)
        .eq('estado', 'ACTIVA');

    // 2. Get plan details to calculate end date
    const { data: plan } = await supabase
        .from('plan')
        .select('duracion_publicacion_dias')
        .eq('id_plan', planId)
        .single();

    if (!plan) throw new Error("Plan not found");

    const fechaFin = new Date();
    fechaFin.setDate(fechaFin.getDate() + 30); // Fixed 30 days membership

    // 3. Create new membership
    const { error } = await supabase
        .from('membresia')
        .insert([{
            id_usuario: userId,
            id_plan: planId,
            fecha_fin: fechaFin.toISOString(),
            estado: 'ACTIVA'
        }]);

    if (error) throw new Error(error.message);
    return true;
};

export const checkCanPublish = async (userId: number) => {
    // Check active membership
    const { data: membership, error } = await supabase
        .from('membresia')
        .select(`
            id_membresia,
            plan:id_plan (
                max_publicaciones,
                duracion_publicacion_dias
            )
        `)
        .eq('id_usuario', userId)
        .eq('estado', 'ACTIVA')
        .single();

    if (error || !membership) return { allowed: false, reason: "No active plan" };

    const plan = membership.plan as any;

    // Check publication limit
    if (plan.max_publicaciones === -1) return { allowed: true, plan };

    const { count } = await supabase
        .from('trabajador_servicio')
        .select('servicio:servicio_id_servicio!inner(estado)', { count: 'exact', head: true })
        .eq('trabajador_id_persona', userId)
        .eq('servicio.estado', 'A');

    if ((count || 0) >= plan.max_publicaciones) {
        return { allowed: false, reason: "Limit reached" };
    }

    return { allowed: true, plan };
};

export const rateService = async (solicitudId: number, rating: number, comment: string) => {
    // 1. Get trabajador_id from solicitud
    const { data: solicitud, error: solError } = await supabase
        .from('solicitud_servicio')
        .select('id_trabajador')
        .eq('id_solicitud', solicitudId)
        .single();

    if (solError || !solicitud) throw new Error("Solicitud not found");

    // 2. Insert rating
    const { error } = await supabase
        .from('calificacion')
        .insert([{
            id_solicitud: solicitudId,
            calificacion: rating,
            comentario: comment
        }]);

    if (error) throw new Error(error.message);

    // 3. Update request status to FINALIZADO
    await supabase
        .from('solicitud_servicio')
        .update({ estado: 'FINALIZADO' })
        .eq('id_solicitud', solicitudId);

    // 4. Update worker rating
    await updateWorkerRating(solicitud.id_trabajador);

    return true;
};

// Helper function to update worker rating
const updateWorkerRating = async (trabajadorId: number) => {
    // Get all ratings for this worker's services
    const { data: ratings } = await supabase
        .from('calificacion')
        .select(`
            calificacion,
            solicitud_servicio!inner (
                id_trabajador
            )
        `)
        .eq('solicitud_servicio.id_trabajador', trabajadorId);

    if (!ratings || ratings.length === 0) return;

    // Calculate average
    const total = ratings.reduce((sum, r: any) => sum + r.calificacion, 0);
    const average = total / ratings.length;

    // Update worker table
    await supabase
        .from('trabajador')
        .update({
            calificacion_promedio: average.toFixed(2),
            total_calificaciones: ratings.length
        })
        .eq('id_trabajador', trabajadorId);
};

// --- Portfolio & Customization ---

export const getPortfolio = async (personaId: number) => {
    // First, get the worker ID from persona ID
    const { data: worker, error: workerError } = await supabase
        .from('trabajador')
        .select('id_trabajador')
        .eq('id_persona', personaId)
        .single();

    if (workerError || !worker) {
        console.error("Worker not found for persona ID:", personaId);
        return [];
    }

    const { data, error } = await supabase
        .from('portafolio')
        .select('*')
        .eq('id_trabajador', worker.id_trabajador)
        .order('fecha_creacion', { ascending: false });

    if (error) throw new Error(error.message);
    return data;
};

export const addPortfolioItem = async (item: {
    userId: number;
    titulo: string;
    descripcion: string;
    fotoUrl: string;
}) => {
    // 1. Check active membership and limits
    const { data: membership, error: memError } = await supabase
        .from('membresia')
        .select(`
            plan:id_plan (
                max_portfolio_items
            )
        `)
        .eq('id_usuario', item.userId)
        .eq('estado', 'ACTIVA')
        .single();

    if (memError || !membership) throw new Error("No active plan found");

    const plan = membership.plan as any;
    const maxItems = plan.max_portfolio_items;

    // 2. Get Worker ID
    const { data: worker, error: workerError } = await supabase
        .from('trabajador')
        .select('id_trabajador')
        .eq('id_persona', item.userId)
        .single();

    if (workerError || !worker) throw new Error("Worker profile not found");

    // 3. Check current count
    if (maxItems !== -1) {
        const { count } = await supabase
            .from('portafolio')
            .select('*', { count: 'exact', head: true })
            .eq('id_trabajador', worker.id_trabajador);

        if ((count || 0) >= maxItems) {
            throw new Error(`Has alcanzado el límite de ${maxItems} items en tu portafolio. Actualiza tu plan para agregar más.`);
        }
    }

    // 4. Insert
    const { error } = await supabase
        .from('portafolio')
        .insert([{
            id_trabajador: worker.id_trabajador,
            titulo: item.titulo,
            descripcion: item.descripcion,
            foto_url: item.fotoUrl
        }]);

    if (error) throw new Error(error.message);
    return true;
};

export const deletePortfolioItem = async (itemId: number) => {
    const { error } = await supabase
        .from('portafolio')
        .delete()
        .eq('id_portafolio', itemId);

    if (error) throw new Error(error.message);
    return true;
};

export const updateProfileTheme = async (workerId: number, theme: { bannerUrl?: string; colorTema?: string }) => {
    const updates: any = {};
    if (theme.bannerUrl) updates.banner_url = theme.bannerUrl;
    if (theme.colorTema) updates.color_tema = theme.colorTema;

    const { error } = await supabase
        .from('perfil')
        .update(updates)
        .eq('trabajador_id_trabajador', workerId);

    if (error) throw new Error(error.message);
    return true;
};

// --- Subscription & Rating ---

export const getCurrentMembership = async (userId: number) => {
    const { data, error } = await supabase
        .from('membresia')
        .select(`
            id_membresia,
            fecha_inicio,
            fecha_fin,
            estado,
            plan:id_plan (
                id_plan,
                nombre,
                precio,
                max_publicaciones,
                max_portfolio_items,
                duracion_publicacion_dias,
                descripcion
            )
        `)
        .eq('id_usuario', userId)
        .eq('estado', 'ACTIVA')
        .order('fecha_fin', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error("Error fetching membership:", error);
        return null;
    }

    return data;
};

export const getVerifiedWorkers = async () => {
    const { data, error } = await supabase
        .from('trabajador')
        .select(`
            id_trabajador,
            id_persona,
            verificado,
            calificacion_promedio,
            total_calificaciones,
            persona:id_persona (
                p_nombre,
                ap_paterno,
                email
            ),
            perfil:perfil!perfil_trab_uk_fk (
                descripcion
            )
        `)
        .eq('verificado', true)
        .order('calificacion_promedio', { ascending: false })
        .order('total_calificaciones', { ascending: false })
        .limit(8);


    if (error) throw new Error(error.message);
    return data;
};

// --- Service Management ---

export const getWorkerServices = async (trabajadorId: number) => {
    const { data, error } = await supabase
        .from('trabajador_servicio')
        .select(`
            servicio:servicio_id_servicio (
                id_servicio,
                nombre_servicio,
                descripcion,
                precio,
                servicio_categoria_servicio (
                    categoria_servicio (
                        id_categ_serv,
                        nombre_categ_serv
                    )
                )
            )
        `)
        .eq('trabajador_id_persona', trabajadorId);

    if (error) throw new Error(error.message);

    // Transform data to flat structure
    return (data || []).map((item: any) => {
        const servicio = item.servicio;
        const categoria = servicio.servicio_categoria_servicio?.[0]?.categoria_servicio;

        return {
            id: servicio.id_servicio,
            titulo: servicio.nombre_servicio,
            descripcion: servicio.descripcion,
            precio: servicio.precio,
            categoriaId: categoria?.id_categ_serv,
            categoriaNombre: categoria?.nombre_categ_serv
        };
    });
};

export const updateService = async (serviceId: number, updates: {
    nombre_servicio?: string;
    descripcion?: string;
    precio?: string;
    categoriaId?: number;
}) => {
    // 1. Update service table
    const serviceUpdates: any = {};
    if (updates.nombre_servicio) serviceUpdates.nombre_servicio = updates.nombre_servicio;
    if (updates.descripcion) serviceUpdates.descripcion = updates.descripcion;
    if (updates.precio) serviceUpdates.precio = updates.precio;

    const { error: serviceError } = await supabase
        .from('servicio')
        .update(serviceUpdates)
        .eq('id_servicio', serviceId);

    if (serviceError) throw new Error(serviceError.message);

    // 2. Update category if changed
    if (updates.categoriaId) {
        // Delete old category association
        await supabase
            .from('servicio_categoria_servicio')
            .delete()
            .eq('servicio_id_servicio', serviceId);

        // Insert new category association
        await supabase
            .from('servicio_categoria_servicio')
            .insert([{
                servicio_id_servicio: serviceId,
                categ_serv_id: updates.categoriaId
            }]);
    }

    return true;
};

export const deleteService = async (serviceId: number, trabajadorId: number) => {
    // Verify ownership
    const { data: ownership } = await supabase
        .from('trabajador_servicio')
        .select('*')
        .eq('servicio_id_servicio', serviceId)
        .eq('trabajador_id_persona', trabajadorId)
        .single();

    if (!ownership) {
        throw new Error("No tienes permiso para eliminar este servicio");
    }

    // Delete from trabajador_servicio
    await supabase
        .from('trabajador_servicio')
        .delete()
        .eq('servicio_id_servicio', serviceId);

    // Delete from servicio_categoria_servicio
    await supabase
        .from('servicio_categoria_servicio')
        .delete()
        .eq('servicio_id_servicio', serviceId);

    // Delete service
    const { error } = await supabase
        .from('servicio')
        .delete()
        .eq('id_servicio', serviceId);

    if (error) throw new Error(error.message);
    return true;
};
