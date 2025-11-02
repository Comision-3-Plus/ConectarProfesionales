-- ============================================================================
-- ÍNDICES DE PERFORMANCE PARA CONECTAR PROFESIONALES
-- ============================================================================
-- Este archivo contiene todos los índices necesarios para optimizar queries
-- en producción. Ejecutar después de crear las tablas base.
--
-- Orden de aplicación:
-- 1. Índices para búsquedas geoespaciales (PostGIS)
-- 2. Índices para trabajos
-- 3. Índices para ofertas
-- 4. Índices para reseñas
-- 5. Índices para usuarios y profesionales
-- 6. Índices compuestos
-- ============================================================================

-- ============================================================================
-- 1. ÍNDICES GEOESPACIALES (PostGIS)
-- ============================================================================

-- Índice espacial GIST para búsquedas de proximidad
-- Usado en: GET /search (búsqueda de profesionales cercanos)
CREATE INDEX IF NOT EXISTS idx_profesionales_ubicacion 
ON profesionales USING GIST (ubicacion);

-- Índice para filtrar por estado de verificación en búsquedas
-- Usado en: Búsquedas que solo muestran profesionales verificados
CREATE INDEX IF NOT EXISTS idx_profesionales_estado_verificacion 
ON profesionales (estado_verificacion);

-- Índice para filtrar profesionales activos
CREATE INDEX IF NOT EXISTS idx_profesionales_is_active 
ON profesionales (is_active);

-- Índice compuesto para búsquedas geoespaciales con filtros
-- Optimiza: Búsqueda de profesionales verificados y activos por ubicación
CREATE INDEX IF NOT EXISTS idx_profesionales_search_optimized 
ON profesionales (estado_verificacion, is_active, oficio_principal_id) 
INCLUDE (rating_promedio, precio_por_hora);

-- ============================================================================
-- 2. ÍNDICES PARA TRABAJOS
-- ============================================================================

-- Índice para queries de trabajos por cliente
-- Usado en: GET /trabajos (cliente ve sus trabajos)
CREATE INDEX IF NOT EXISTS idx_trabajos_cliente_id 
ON trabajos (cliente_id);

-- Índice para queries de trabajos por profesional
-- Usado en: GET /professional/trabajos (profesional ve sus trabajos)
CREATE INDEX IF NOT EXISTS idx_trabajos_profesional_id 
ON trabajos (profesional_id);

-- Índice para filtrar trabajos por estado
-- Usado en: Filtros de estado en listados de trabajos
CREATE INDEX IF NOT EXISTS idx_trabajos_estado 
ON trabajos (estado);

-- Índice para filtrar trabajos por estado de escrow
-- Usado en: Procesamiento de pagos y liberaciones
CREATE INDEX IF NOT EXISTS idx_trabajos_escrow_estado 
ON trabajos (escrow_estado);

-- Índice para queries de trabajos por oferta
CREATE INDEX IF NOT EXISTS idx_trabajos_oferta_id 
ON trabajos (oferta_id);

-- Índice para ordenar trabajos por fecha de creación
CREATE INDEX IF NOT EXISTS idx_trabajos_fecha_creacion 
ON trabajos (fecha_creacion DESC);

-- Índice compuesto para dashboard de cliente
-- Optimiza: Lista de trabajos activos de un cliente ordenados por fecha
CREATE INDEX IF NOT EXISTS idx_trabajos_cliente_activos 
ON trabajos (cliente_id, estado, fecha_creacion DESC) 
WHERE estado IN ('PENDIENTE', 'EN_CURSO', 'COMPLETADO_PENDIENTE_APROBACION');

-- Índice compuesto para dashboard de profesional
-- Optimiza: Lista de trabajos activos de un profesional ordenados por fecha
CREATE INDEX IF NOT EXISTS idx_trabajos_profesional_activos 
ON trabajos (profesional_id, estado, fecha_creacion DESC) 
WHERE estado IN ('PENDIENTE', 'EN_CURSO', 'COMPLETADO_PENDIENTE_APROBACION');

-- Índice para trabajos con pago en escrow (procesamiento de pagos)
CREATE INDEX IF NOT EXISTS idx_trabajos_escrow_pendientes 
ON trabajos (escrow_estado, fecha_modificacion) 
WHERE escrow_estado = 'PAGADO_EN_ESCROW';

-- ============================================================================
-- 3. ÍNDICES PARA OFERTAS
-- ============================================================================

-- Índice para queries de ofertas por cliente
-- Usado en: GET /ofertas (cliente ve ofertas recibidas)
CREATE INDEX IF NOT EXISTS idx_ofertas_cliente_id 
ON ofertas (cliente_id);

-- Índice para queries de ofertas por profesional
-- Usado en: GET /professional/ofertas (profesional ve ofertas enviadas)
CREATE INDEX IF NOT EXISTS idx_ofertas_profesional_id 
ON ofertas (profesional_id);

-- Índice para filtrar ofertas por estado
-- Usado en: Filtros de estado en listados de ofertas
CREATE INDEX IF NOT EXISTS idx_ofertas_estado 
ON ofertas (estado);

-- Índice para ordenar ofertas por fecha de creación
CREATE INDEX IF NOT EXISTS idx_ofertas_fecha_creacion 
ON ofertas (fecha_creacion DESC);

-- Índice compuesto para ofertas pendientes de un cliente
-- Optimiza: Vista de ofertas pendientes de respuesta
CREATE INDEX IF NOT EXISTS idx_ofertas_cliente_pendientes 
ON ofertas (cliente_id, estado, fecha_creacion DESC) 
WHERE estado = 'PENDIENTE';

-- Índice compuesto para ofertas pendientes de un profesional
CREATE INDEX IF NOT EXISTS idx_ofertas_profesional_pendientes 
ON ofertas (profesional_id, estado, fecha_creacion DESC) 
WHERE estado = 'PENDIENTE';

-- Índice para cleanup de ofertas expiradas
CREATE INDEX IF NOT EXISTS idx_ofertas_expiracion 
ON ofertas (fecha_expiracion) 
WHERE estado = 'PENDIENTE';

-- ============================================================================
-- 4. ÍNDICES PARA RESEÑAS
-- ============================================================================

-- Índice para queries de reseñas por profesional
-- Usado en: GET /professional/{id}/reviews (ver reseñas de un profesional)
CREATE INDEX IF NOT EXISTS idx_resenas_profesional_id 
ON resenas (profesional_id);

-- Índice para queries de reseñas por cliente
-- Usado en: GET /me/reviews (cliente ve sus reseñas)
CREATE INDEX IF NOT EXISTS idx_resenas_cliente_id 
ON resenas (cliente_id);

-- Índice para queries de reseñas por trabajo
-- Usado en: Verificar si un trabajo ya tiene reseña
CREATE INDEX IF NOT EXISTS idx_resenas_trabajo_id 
ON resenas (trabajo_id);

-- Índice para ordenar reseñas por fecha
CREATE INDEX IF NOT EXISTS idx_resenas_fecha_creacion 
ON resenas (fecha_creacion DESC);

-- Índice compuesto para reseñas públicas de un profesional
-- Optimiza: Vista pública de reseñas ordenadas por fecha
CREATE INDEX IF NOT EXISTS idx_resenas_profesional_publicas 
ON resenas (profesional_id, fecha_creacion DESC) 
INCLUDE (rating, comentario);

-- Índice para calcular rating promedio de profesional
CREATE INDEX IF NOT EXISTS idx_resenas_profesional_rating 
ON resenas (profesional_id, rating);

-- ============================================================================
-- 5. ÍNDICES PARA USUARIOS
-- ============================================================================

-- Índice único para email (autenticación)
-- Usado en: Login, registro, recuperación de contraseña
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email 
ON usuarios (email);

-- Índice para filtrar usuarios por rol
-- Usado en: Admin panel, estadísticas
CREATE INDEX IF NOT EXISTS idx_usuarios_rol 
ON usuarios (rol);

-- Índice para filtrar usuarios activos
-- Usado en: Login, validaciones
CREATE INDEX IF NOT EXISTS idx_usuarios_is_active 
ON usuarios (is_active);

-- Índice para búsqueda por Firebase UID
CREATE INDEX IF NOT EXISTS idx_usuarios_firebase_uid 
ON usuarios (firebase_uid) 
WHERE firebase_uid IS NOT NULL;

-- Índice compuesto para usuarios activos por rol
CREATE INDEX IF NOT EXISTS idx_usuarios_activos_rol 
ON usuarios (rol, is_active, fecha_registro DESC);

-- ============================================================================
-- 6. ÍNDICES PARA PORTFOLIO
-- ============================================================================

-- Índice para queries de portfolio por profesional
-- Usado en: GET /professional/{id}/portfolio
CREATE INDEX IF NOT EXISTS idx_portfolio_profesional_id 
ON portfolio_items (profesional_id);

-- Índice para ordenar items de portfolio
CREATE INDEX IF NOT EXISTS idx_portfolio_fecha_creacion 
ON portfolio_items (fecha_creacion DESC);

-- Índice compuesto para portfolio público de un profesional
CREATE INDEX IF NOT EXISTS idx_portfolio_profesional_publico 
ON portfolio_items (profesional_id, fecha_creacion DESC) 
INCLUDE (titulo, descripcion);

-- ============================================================================
-- 7. ÍNDICES PARA NOTIFICACIONES
-- ============================================================================

-- Índice para queries de notificaciones por usuario
-- Usado en: GET /notifications (usuario ve sus notificaciones)
CREATE INDEX IF NOT EXISTS idx_notificaciones_user_id 
ON notificaciones (user_id);

-- Índice para filtrar notificaciones no leídas
CREATE INDEX IF NOT EXISTS idx_notificaciones_no_leidas 
ON notificaciones (user_id, leido, fecha_creacion DESC) 
WHERE leido = FALSE;

-- Índice para ordenar notificaciones por fecha
CREATE INDEX IF NOT EXISTS idx_notificaciones_fecha 
ON notificaciones (fecha_creacion DESC);

-- ============================================================================
-- 8. ÍNDICES PARA GAMIFICACIÓN
-- ============================================================================

-- Índice para queries de niveles por usuario
CREATE INDEX IF NOT EXISTS idx_niveles_user_id 
ON user_niveles (user_id);

-- Índice para ranking de usuarios por XP
CREATE INDEX IF NOT EXISTS idx_niveles_ranking 
ON user_niveles (xp_total DESC, nivel DESC);

-- Índice para historial de badges
CREATE INDEX IF NOT EXISTS idx_badges_user_id 
ON user_badges (user_id);

-- ============================================================================
-- 9. ÍNDICES PARA TRANSACCIONES Y PAGOS
-- ============================================================================

-- Índice para queries de transacciones por trabajo
CREATE INDEX IF NOT EXISTS idx_transacciones_trabajo_id 
ON transacciones (trabajo_id) 
WHERE trabajo_id IS NOT NULL;

-- Índice para queries de transacciones por usuario
CREATE INDEX IF NOT EXISTS idx_transacciones_user_id 
ON transacciones (user_id);

-- Índice para búsqueda por ID de MercadoPago
CREATE INDEX IF NOT EXISTS idx_transacciones_mercadopago_id 
ON transacciones (mercadopago_payment_id) 
WHERE mercadopago_payment_id IS NOT NULL;

-- Índice para transacciones por estado
CREATE INDEX IF NOT EXISTS idx_transacciones_estado 
ON transacciones (estado, fecha_creacion DESC);

-- Índice para auditoría de pagos
CREATE INDEX IF NOT EXISTS idx_transacciones_auditoria 
ON transacciones (tipo, estado, fecha_creacion DESC) 
INCLUDE (monto);

-- ============================================================================
-- 10. ÍNDICES PARA CHAT (FIRESTORE SYNC)
-- ============================================================================

-- Índice para mensajes por chat
CREATE INDEX IF NOT EXISTS idx_mensajes_chat_id 
ON mensajes (chat_id, fecha_creacion DESC) 
WHERE chat_id IS NOT NULL;

-- Índice para mensajes no leídos
CREATE INDEX IF NOT EXISTS idx_mensajes_no_leidos 
ON mensajes (destinatario_id, leido, fecha_creacion DESC) 
WHERE leido = FALSE;

-- ============================================================================
-- 11. ÍNDICES COMPUESTOS ADICIONALES PARA QUERIES COMPLEJAS
-- ============================================================================

-- Índice para búsqueda de profesionales con filtros múltiples
-- Optimiza: Búsqueda con oficio + verificación + rating
CREATE INDEX IF NOT EXISTS idx_profesionales_search_complex 
ON profesionales (oficio_principal_id, estado_verificacion, rating_promedio DESC) 
WHERE is_active = TRUE;

-- Índice para estadísticas de profesional
-- Optimiza: Cálculo de stats en dashboard de profesional
CREATE INDEX IF NOT EXISTS idx_trabajos_stats_profesional 
ON trabajos (profesional_id, estado) 
INCLUDE (precio_final, comision_plataforma, monto_liberado);

-- Índice para estadísticas de cliente
-- Optimiza: Cálculo de stats en dashboard de cliente
CREATE INDEX IF NOT EXISTS idx_trabajos_stats_cliente 
ON trabajos (cliente_id, estado) 
INCLUDE (precio_final);

-- Índice para reportes de admin
-- Optimiza: Dashboard de administrador con métricas
CREATE INDEX IF NOT EXISTS idx_trabajos_reportes_admin 
ON trabajos (fecha_creacion, estado) 
INCLUDE (precio_final, comision_plataforma);

-- ============================================================================
-- ANÁLISIS Y MANTENIMIENTO
-- ============================================================================

-- Comando para analizar el uso de índices:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
-- FROM pg_stat_user_indexes
-- ORDER BY idx_scan DESC;

-- Comando para encontrar índices no utilizados:
-- SELECT schemaname, tablename, indexname
-- FROM pg_stat_user_indexes
-- WHERE idx_scan = 0 AND indexrelname NOT LIKE 'pg_%';

-- Comando para ver el tamaño de los índices:
-- SELECT schemaname, tablename, indexname, pg_size_pretty(pg_relation_size(indexrelid))
-- FROM pg_stat_user_indexes
-- ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================================
-- VACUUM Y ANALYZE
-- ============================================================================

-- Ejecutar ANALYZE después de crear los índices para actualizar estadísticas
ANALYZE profesionales;
ANALYZE trabajos;
ANALYZE ofertas;
ANALYZE resenas;
ANALYZE usuarios;
ANALYZE portfolio_items;
ANALYZE notificaciones;
ANALYZE transacciones;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
