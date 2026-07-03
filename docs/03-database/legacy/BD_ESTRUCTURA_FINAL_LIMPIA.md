# BD legacy guia - BD_ESTRUCTURA_FINAL_LIMPIA

**Estado:** guia documental legacy. No ejecutar como migracion del sistema nuevo.

Este SQL representa la base actual/legacy del motor de evaluaciones agricolas. Segun docs/03-database/legacy-bd-vs-master-corrections.md, no es la fuente de verdad del destino SaaS geoespacial multiempresa. Sirve para:

- Inventariar tablas existentes.
- Migrar conceptos utiles hacia el modelo canonico.
- Conservar el motor de evaluaciones configurable como referencia.
- Comparar legacy contra el nuevo esquema pps/api/prisma/schema.prisma.

## Veredicto operativo

- Master v0.4 y schema.prisma canonico son el destino.
- Esta BD es origen legacy y guia de migracion.
- No crear migraciones ejecutables desde este archivo sin ADR y plan de migracion.

## SQL original

``sql
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- ESTRUCTURA BASE DE DATOS - LIMPIA Y OPTIMIZADA
-- Sistema de Evaluaciones AgrÃ­colas (HÃ­brido: JSONB + Relacional)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- CAMBIOS APLICADOS:
-- âœ… Eliminadas redundancias de timestamps
-- âœ… Eliminada tabla registro_detalle (redundante)
-- âœ… Optimizado para estructura hÃ­brida con JSONB
-- âœ… Ãndices para performance
-- âœ… Triggers para actualizaciÃ³n de timestamps
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

BEGIN;

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABLAS CATÃLOGO (No cambian, informaciÃ³n estÃ¡tica)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE TABLE IF NOT EXISTS public.pais (
    id_pais smallserial NOT NULL,
    nombre character varying(100) NOT NULL UNIQUE,
    iso2 character(2),
    iso3 character(3),
    codigo_numerico smallint,
    activo boolean NOT NULL DEFAULT true,
    CONSTRAINT pais_pkey PRIMARY KEY (id_pais)
);
COMMENT ON TABLE public.pais IS 'CatÃ¡logo de paÃ­ses.';

CREATE TABLE IF NOT EXISTS public.cultivo (
    id_cultivo smallserial NOT NULL,
    nombre character varying(100) NOT NULL UNIQUE,
    codigo character varying(20) UNIQUE,
    descripcion text,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamp with time zone NOT NULL DEFAULT now(),
    actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT cultivo_pkey PRIMARY KEY (id_cultivo)
);
COMMENT ON TABLE public.cultivo IS 'Tipos de cultivos (maÃ­z, papa, trigo, etc.).';

CREATE TABLE IF NOT EXISTS public.variedad (
    id_variedad serial NOT NULL,
    id_cultivo smallint NOT NULL,
    nombre character varying(100) NOT NULL,
    codigo character varying(20),
    descripcion text,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamp with time zone NOT NULL DEFAULT now(),
    actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT variedad_pkey PRIMARY KEY (id_variedad),
    CONSTRAINT variedad_id_cultivo_nombre_key UNIQUE (id_cultivo, nombre)
);
COMMENT ON TABLE public.variedad IS 'Variedades de cultivos.';

CREATE TABLE IF NOT EXISTS public.tipo_evaluacion (
    id_tipo_evaluacion smallserial NOT NULL,
    nombre character varying(100) NOT NULL UNIQUE,
    descripcion text,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT tipo_evaluacion_pkey PRIMARY KEY (id_tipo_evaluacion)
);
COMMENT ON TABLE public.tipo_evaluacion IS 'Tipos de evaluaciones (salud, plagas, fenologÃ­a, etc.).';

CREATE TABLE IF NOT EXISTS public.evaluacion (
    id_evaluacion serial NOT NULL,
    id_tipo_evaluacion smallint NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion text,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT evaluacion_pkey PRIMARY KEY (id_evaluacion),
    CONSTRAINT evaluacion_id_tipo_evaluacion_nombre_key UNIQUE (id_tipo_evaluacion, nombre)
);
COMMENT ON TABLE public.evaluacion IS 'Evaluaciones especÃ­ficas por tipo.';

CREATE TABLE IF NOT EXISTS public.evaluacion_cultivo (
    id_evaluacion_cultivo serial NOT NULL,
    id_evaluacion integer NOT NULL,
    id_cultivo smallint NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT evaluacion_cultivo_pkey PRIMARY KEY (id_evaluacion_cultivo),
    CONSTRAINT evaluacion_cultivo_id_evaluacion_id_cultivo_key UNIQUE (id_evaluacion, id_cultivo)
);
COMMENT ON TABLE public.evaluacion_cultivo 
    IS 'VinculaciÃ³n: quÃ© evaluaciones aplican a cada cultivo.';

CREATE TABLE IF NOT EXISTS public.campo_evaluacion (
    id_campo_evaluacion serial NOT NULL,
    id_evaluacion_cultivo integer NOT NULL,
    clave character varying(100) NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion text,
    tipo_dato character varying(30) NOT NULL,
    valor_minimo numeric,
    valor_maximo numeric,
    obligatorio boolean DEFAULT false,
    orden_visualizacion smallint DEFAULT 0,
    placeholder character varying(200),
    valor_defecto character varying(500),
    opciones_select jsonb,
    validacion_regex character varying(500),
    ayuda_texto text,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT campo_evaluacion_pkey PRIMARY KEY (id_campo_evaluacion),
    CONSTRAINT campo_evaluacion_id_evaluacion_cultivo_clave_key UNIQUE (id_evaluacion_cultivo, clave)
);
COMMENT ON TABLE public.campo_evaluacion IS 'Campos dinÃ¡micos por evaluaciÃ³n y cultivo.';

CREATE TABLE IF NOT EXISTS public.estado_registro (
    id_estado smallserial NOT NULL,
    nombre character varying(50) NOT NULL UNIQUE,
    descripcion text,
    es_terminal boolean DEFAULT false,
    creado_en timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT estado_registro_pkey PRIMARY KEY (id_estado)
);
COMMENT ON TABLE public.estado_registro 
    IS 'Estados: borrador, enviado, validado, rechazado.';

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABLAS GEOGRÃFICAS
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE TABLE IF NOT EXISTS public.fundo (
    id_fundo serial NOT NULL,
    id_pais smallint NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion text,
    area_total_hectareas numeric(12, 4),
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamp with time zone NOT NULL DEFAULT now(),
    actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT fundo_pkey PRIMARY KEY (id_fundo),
    CONSTRAINT fundo_id_pais_nombre_key UNIQUE (id_pais, nombre)
);
COMMENT ON TABLE public.fundo IS 'Fundos o propiedades agrÃ­colas.';

CREATE TABLE IF NOT EXISTS public.parcela (
    id_parcela serial NOT NULL,
    id_fundo integer NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion text,
    area_hectareas numeric(10, 4),
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamp with time zone NOT NULL DEFAULT now(),
    actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT parcela_pkey PRIMARY KEY (id_parcela),
    CONSTRAINT parcela_id_fundo_nombre_key UNIQUE (id_fundo, nombre)
);
COMMENT ON TABLE public.parcela IS 'Divisiones de un fundo.';

CREATE TABLE IF NOT EXISTS public.subparcela (
    id_subparcela serial NOT NULL,
    id_parcela integer NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion text,
    area_hectareas numeric(10, 4),
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamp with time zone NOT NULL DEFAULT now(),
    actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT subparcela_pkey PRIMARY KEY (id_subparcela),
    CONSTRAINT subparcela_id_parcela_nombre_key UNIQUE (id_parcela, nombre)
);
COMMENT ON TABLE public.subparcela IS 'Subdivisiones de parcela.';

CREATE TABLE IF NOT EXISTS public.lote (
    id_lote serial NOT NULL,
    id_subparcela integer,
    nombre character varying(150) NOT NULL,
    descripcion text,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamp with time zone NOT NULL DEFAULT now(),
    actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT lote_pkey PRIMARY KEY (id_lote)
);
COMMENT ON TABLE public.lote IS 'Unidad geogrÃ¡fica mÃ­nima para cultivar.';

CREATE TABLE IF NOT EXISTS public.sublote (
    id_sublote serial NOT NULL,
    id_lote integer NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion text,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamp with time zone NOT NULL DEFAULT now(),
    actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT sublote_pkey PRIMARY KEY (id_sublote),
    CONSTRAINT sublote_id_lote_nombre_key UNIQUE (id_lote, nombre)
);
COMMENT ON TABLE public.sublote IS 'Subdivisiones de un lote.';

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABLAS DE NEGOCIO
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE TABLE IF NOT EXISTS public.campania (
    id_campania serial NOT NULL,
    id_cultivo smallint NOT NULL,
    nombre character varying(150) NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin_estimada date,
    fecha_fin_real date,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamp with time zone NOT NULL DEFAULT now(),
    actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT campania_pkey PRIMARY KEY (id_campania),
    CONSTRAINT campania_id_cultivo_nombre_key UNIQUE (id_cultivo, nombre)
);
COMMENT ON TABLE public.campania IS 'Ciclos de cultivo con fechas de inicio y fin.';

CREATE TABLE IF NOT EXISTS public.cultivo_lote_campania (
    id_clc serial NOT NULL,
    id_campania integer NOT NULL,
    id_lote integer NOT NULL,
    id_sublote integer,
    fecha_siembra date,
    fecha_cosecha_estimada date,
    fecha_cosecha_real date,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamp with time zone NOT NULL DEFAULT now(),
    actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT cultivo_lote_campania_pkey PRIMARY KEY (id_clc),
    CONSTRAINT cultivo_lote_campania_id_campania_id_lote_key UNIQUE (id_campania, id_lote)
);
COMMENT ON TABLE public.cultivo_lote_campania 
    IS 'VinculaciÃ³n: campaÃ±a + lote + sublote (opcional).';

CREATE TABLE IF NOT EXISTS public.area_cultivable (
    id_area_cultivable serial NOT NULL,
    id_clc integer NOT NULL,
    id_variedad integer NOT NULL,
    area_hectareas numeric(10, 4) NOT NULL,
    densidad_plantas_ha numeric(8, 2),
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamp with time zone NOT NULL DEFAULT now(),
    actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT area_cultivable_pkey PRIMARY KEY (id_area_cultivable),
    CONSTRAINT area_cultivable_id_clc_id_variedad_key UNIQUE (id_clc, id_variedad)
);
COMMENT ON TABLE public.area_cultivable 
    IS 'Ãreas cultivables por variedad en cada CLC.';

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABLAS DE USUARIOS Y SEGURIDAD
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE TABLE IF NOT EXISTS public.rol (
    id_rol serial NOT NULL,
    nombre character varying(100) NOT NULL UNIQUE,
    descripcion text,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamp with time zone NOT NULL DEFAULT now(),
    actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT rol_pkey PRIMARY KEY (id_rol)
);
COMMENT ON TABLE public.rol IS 'Roles de usuarios del sistema.';

CREATE TABLE IF NOT EXISTS public.usuario (
    id_usuario serial NOT NULL,
    id_rol integer NOT NULL,
    nombre character varying(150) NOT NULL,
    email character varying(100) NOT NULL UNIQUE,
    contrasena text NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    creado_en timestamp with time zone NOT NULL DEFAULT now(),
    actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario)
);
COMMENT ON TABLE public.usuario IS 'Usuarios del sistema.';

CREATE TABLE IF NOT EXISTS public.usuario_cultivo (
    id_usuario_cultivo serial NOT NULL,
    id_usuario integer NOT NULL,
    id_cultivo smallint NOT NULL,
    CONSTRAINT usuario_cultivo_pkey PRIMARY KEY (id_usuario_cultivo),
    CONSTRAINT usuario_cultivo_id_usuario_id_cultivo_key UNIQUE (id_usuario, id_cultivo)
);
COMMENT ON TABLE public.usuario_cultivo 
    IS 'Cultivos asignados a cada usuario.';

CREATE TABLE IF NOT EXISTS public.permiso_rol_modulo (
    id_permiso serial NOT NULL,
    id_rol integer NOT NULL,
    modulo character varying(100) NOT NULL,
    puede_crear boolean DEFAULT false,
    puede_leer boolean DEFAULT false,
    puede_editar boolean DEFAULT false,
    puede_eliminar boolean DEFAULT false,
    CONSTRAINT permiso_rol_modulo_pkey PRIMARY KEY (id_permiso),
    CONSTRAINT permiso_rol_modulo_id_rol_modulo_key UNIQUE (id_rol, modulo)
);
COMMENT ON TABLE public.permiso_rol_modulo 
    IS 'Permisos por rol y mÃ³dulo.';

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABLA PRINCIPAL: REGISTRO (HÃBRIDO)
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE TABLE IF NOT EXISTS public.registro (
    id_registro serial NOT NULL,
    id_area_cultivable integer NOT NULL,
    id_evaluacion_cultivo integer NOT NULL,
    id_usuario integer NOT NULL,
    id_estado smallint NOT NULL,
    datos_evaluacion jsonb NOT NULL DEFAULT '{}'::jsonb,
    observacion text,
    creado_en timestamp with time zone NOT NULL DEFAULT now(),
    actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
    activo boolean NOT NULL DEFAULT true,
    CONSTRAINT registro_pkey PRIMARY KEY (id_registro)
);
COMMENT ON TABLE public.registro 
    IS 'Registros de evaluaciÃ³n. HÃ­brido: metadata + datos_evaluacion (JSONB).';
COMMENT ON COLUMN public.registro.datos_evaluacion 
    IS 'Valores de campos: {"clave_campo": valor, ...}. Ejemplo: {"plagas": 5, "enfermedad": "roya"}';

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TABLAS DE AUDITORÃA Y CONFIGURACIÃ“N
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE TABLE IF NOT EXISTS public.registro_audit (
    id_audit serial NOT NULL,
    id_registro integer NOT NULL,
    id_usuario integer,
    accion character varying(50) NOT NULL,
    datos_anterior jsonb,
    datos_nuevo jsonb,
    creado_en timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT registro_audit_pkey PRIMARY KEY (id_audit)
);
COMMENT ON TABLE public.registro_audit 
    IS 'Historial de cambios en registros.';

CREATE TABLE IF NOT EXISTS public.integracion_api (
    id_integracion serial NOT NULL,
    nombre character varying(100) NOT NULL UNIQUE,
    tipo character varying(50),
    url_endpoint character varying(500),
    api_key text,
    secreto text,
    activo boolean DEFAULT true,
    creado_en timestamp with time zone NOT NULL DEFAULT now(),
    actualizado_en timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT integracion_api_pkey PRIMARY KEY (id_integracion)
);
COMMENT ON TABLE public.integracion_api 
    IS 'Configuraciones de integraciones externas.';

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- FOREIGN KEYS
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

ALTER TABLE IF EXISTS public.variedad
    ADD CONSTRAINT variedad_id_cultivo_fkey FOREIGN KEY (id_cultivo)
    REFERENCES public.cultivo (id_cultivo) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.evaluacion
    ADD CONSTRAINT evaluacion_id_tipo_evaluacion_fkey FOREIGN KEY (id_tipo_evaluacion)
    REFERENCES public.tipo_evaluacion (id_tipo_evaluacion) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.evaluacion_cultivo
    ADD CONSTRAINT evaluacion_cultivo_id_evaluacion_fkey FOREIGN KEY (id_evaluacion)
    REFERENCES public.evaluacion (id_evaluacion) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.evaluacion_cultivo
    ADD CONSTRAINT evaluacion_cultivo_id_cultivo_fkey FOREIGN KEY (id_cultivo)
    REFERENCES public.cultivo (id_cultivo) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.campo_evaluacion
    ADD CONSTRAINT campo_evaluacion_id_evaluacion_cultivo_fkey FOREIGN KEY (id_evaluacion_cultivo)
    REFERENCES public.evaluacion_cultivo (id_evaluacion_cultivo) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.fundo
    ADD CONSTRAINT fundo_id_pais_fkey FOREIGN KEY (id_pais)
    REFERENCES public.pais (id_pais) ON DELETE RESTRICT;

ALTER TABLE IF EXISTS public.parcela
    ADD CONSTRAINT parcela_id_fundo_fkey FOREIGN KEY (id_fundo)
    REFERENCES public.fundo (id_fundo) ON DELETE RESTRICT;

ALTER TABLE IF EXISTS public.subparcela
    ADD CONSTRAINT subparcela_id_parcela_fkey FOREIGN KEY (id_parcela)
    REFERENCES public.parcela (id_parcela) ON DELETE RESTRICT;

ALTER TABLE IF EXISTS public.lote
    ADD CONSTRAINT lote_id_subparcela_fkey FOREIGN KEY (id_subparcela)
    REFERENCES public.subparcela (id_subparcela) ON DELETE RESTRICT;

ALTER TABLE IF EXISTS public.sublote
    ADD CONSTRAINT sublote_id_lote_fkey FOREIGN KEY (id_lote)
    REFERENCES public.lote (id_lote) ON DELETE RESTRICT;

ALTER TABLE IF EXISTS public.campania
    ADD CONSTRAINT campania_id_cultivo_fkey FOREIGN KEY (id_cultivo)
    REFERENCES public.cultivo (id_cultivo) ON DELETE RESTRICT;

ALTER TABLE IF EXISTS public.cultivo_lote_campania
    ADD CONSTRAINT cultivo_lote_campania_id_campania_fkey FOREIGN KEY (id_campania)
    REFERENCES public.campania (id_campania) ON DELETE RESTRICT;

ALTER TABLE IF EXISTS public.cultivo_lote_campania
    ADD CONSTRAINT cultivo_lote_campania_id_lote_fkey FOREIGN KEY (id_lote)
    REFERENCES public.lote (id_lote) ON DELETE RESTRICT;

ALTER TABLE IF EXISTS public.cultivo_lote_campania
    ADD CONSTRAINT cultivo_lote_campania_id_sublote_fkey FOREIGN KEY (id_sublote)
    REFERENCES public.sublote (id_sublote) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.area_cultivable
    ADD CONSTRAINT area_cultivable_id_clc_fkey FOREIGN KEY (id_clc)
    REFERENCES public.cultivo_lote_campania (id_clc) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.area_cultivable
    ADD CONSTRAINT area_cultivable_id_variedad_fkey FOREIGN KEY (id_variedad)
    REFERENCES public.variedad (id_variedad) ON DELETE RESTRICT;

ALTER TABLE IF EXISTS public.usuario
    ADD CONSTRAINT usuario_id_rol_fkey FOREIGN KEY (id_rol)
    REFERENCES public.rol (id_rol) ON DELETE RESTRICT;

ALTER TABLE IF EXISTS public.usuario_cultivo
    ADD CONSTRAINT usuario_cultivo_id_usuario_fkey FOREIGN KEY (id_usuario)
    REFERENCES public.usuario (id_usuario) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.usuario_cultivo
    ADD CONSTRAINT usuario_cultivo_id_cultivo_fkey FOREIGN KEY (id_cultivo)
    REFERENCES public.cultivo (id_cultivo) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.permiso_rol_modulo
    ADD CONSTRAINT permiso_rol_modulo_id_rol_fkey FOREIGN KEY (id_rol)
    REFERENCES public.rol (id_rol) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.registro
    ADD CONSTRAINT registro_id_area_cultivable_fkey FOREIGN KEY (id_area_cultivable)
    REFERENCES public.area_cultivable (id_area_cultivable) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.registro
    ADD CONSTRAINT registro_id_evaluacion_cultivo_fkey FOREIGN KEY (id_evaluacion_cultivo)
    REFERENCES public.evaluacion_cultivo (id_evaluacion_cultivo) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.registro
    ADD CONSTRAINT registro_id_usuario_fkey FOREIGN KEY (id_usuario)
    REFERENCES public.usuario (id_usuario) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.registro
    ADD CONSTRAINT registro_id_estado_fkey FOREIGN KEY (id_estado)
    REFERENCES public.estado_registro (id_estado) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.registro_audit
    ADD CONSTRAINT registro_audit_id_registro_fkey FOREIGN KEY (id_registro)
    REFERENCES public.registro (id_registro) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.registro_audit
    ADD CONSTRAINT registro_audit_id_usuario_fkey FOREIGN KEY (id_usuario)
    REFERENCES public.usuario (id_usuario) ON DELETE SET NULL;

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- ÃNDICES PARA PERFORMANCE
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE INDEX IF NOT EXISTS idx_variedad_cultivo ON public.variedad(id_cultivo);
CREATE INDEX IF NOT EXISTS idx_campo_evaluacion_eval ON public.campo_evaluacion(id_evaluacion_cultivo);
CREATE INDEX IF NOT EXISTS idx_fundo_pais ON public.fundo(id_pais);
CREATE INDEX IF NOT EXISTS idx_parcela_fundo ON public.parcela(id_fundo);
CREATE INDEX IF NOT EXISTS idx_subparcela_parcela ON public.subparcela(id_parcela);
CREATE INDEX IF NOT EXISTS idx_lote_subparcela ON public.lote(id_subparcela);
CREATE INDEX IF NOT EXISTS idx_sublote_lote ON public.sublote(id_lote);
CREATE INDEX IF NOT EXISTS idx_campania_cultivo ON public.campania(id_cultivo);
CREATE INDEX IF NOT EXISTS idx_clc_campania ON public.cultivo_lote_campania(id_campania);
CREATE INDEX IF NOT EXISTS idx_clc_lote ON public.cultivo_lote_campania(id_lote);
CREATE INDEX IF NOT EXISTS idx_clc_sublote ON public.cultivo_lote_campania(id_sublote);
CREATE INDEX IF NOT EXISTS idx_area_clc ON public.area_cultivable(id_clc);
CREATE INDEX IF NOT EXISTS idx_area_variedad ON public.area_cultivable(id_variedad);
CREATE INDEX IF NOT EXISTS idx_usuario_rol ON public.usuario(id_rol);
CREATE INDEX IF NOT EXISTS idx_usuario_cultivo ON public.usuario_cultivo(id_usuario);
CREATE INDEX IF NOT EXISTS idx_usuario_cultivo_cultivo ON public.usuario_cultivo(id_cultivo);
CREATE INDEX IF NOT EXISTS idx_registro_area ON public.registro(id_area_cultivable);
CREATE INDEX IF NOT EXISTS idx_registro_eval ON public.registro(id_evaluacion_cultivo);
CREATE INDEX IF NOT EXISTS idx_registro_usuario ON public.registro(id_usuario);
CREATE INDEX IF NOT EXISTS idx_registro_estado ON public.registro(id_estado);
CREATE INDEX IF NOT EXISTS idx_registro_creado ON public.registro(creado_en);
CREATE INDEX IF NOT EXISTS idx_audit_registro ON public.registro_audit(id_registro);
CREATE INDEX IF NOT EXISTS idx_audit_usuario ON public.registro_audit(id_usuario);
CREATE INDEX IF NOT EXISTS idx_audit_creado ON public.registro_audit(creado_en);

-- Ãndice para bÃºsquedas JSONB
CREATE INDEX IF NOT EXISTS idx_registro_datos_evaluacion ON public.registro USING gin(datos_evaluacion);

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- TRIGGERS PARA ACTUALIZACIÃ“N DE TIMESTAMPS
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE OR REPLACE FUNCTION public.actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas que tienen actualizado_en
CREATE TRIGGER trigger_cultivo_actualizar
    BEFORE UPDATE ON public.cultivo
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_variedad_actualizar
    BEFORE UPDATE ON public.variedad
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_fundo_actualizar
    BEFORE UPDATE ON public.fundo
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_parcela_actualizar
    BEFORE UPDATE ON public.parcela
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_subparcela_actualizar
    BEFORE UPDATE ON public.subparcela
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_lote_actualizar
    BEFORE UPDATE ON public.lote
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_sublote_actualizar
    BEFORE UPDATE ON public.sublote
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_campania_actualizar
    BEFORE UPDATE ON public.campania
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_clc_actualizar
    BEFORE UPDATE ON public.cultivo_lote_campania
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_area_actualizar
    BEFORE UPDATE ON public.area_cultivable
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_usuario_actualizar
    BEFORE UPDATE ON public.usuario
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_rol_actualizar
    BEFORE UPDATE ON public.rol
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_registro_actualizar
    BEFORE UPDATE ON public.registro
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_timestamp();

CREATE TRIGGER trigger_integracion_actualizar
    BEFORE UPDATE ON public.integracion_api
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_timestamp();

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- FUNCIONES ÃšTILES
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

CREATE OR REPLACE FUNCTION public.obtener_campos_formulario(p_id_evaluacion_cultivo integer)
RETURNS TABLE (
    id_campo_evaluacion integer,
    clave varchar,
    nombre varchar,
    tipo_dato varchar,
    valor_minimo numeric,
    valor_maximo numeric,
    obligatorio boolean,
    orden_visualizacion smallint,
    placeholder varchar,
    valor_defecto varchar,
    opciones_select jsonb,
    validacion_regex varchar,
    ayuda_texto text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ce.id_campo_evaluacion,
        ce.clave,
        ce.nombre,
        ce.tipo_dato,
        ce.valor_minimo,
        ce.valor_maximo,
        ce.obligatorio,
        ce.orden_visualizacion,
        ce.placeholder,
        ce.valor_defecto,
        COALESCE(ce.opciones_select, '[]'::jsonb),
        ce.validacion_regex,
        ce.ayuda_texto
    FROM public.campo_evaluacion ce
    WHERE ce.id_evaluacion_cultivo = p_id_evaluacion_cultivo
        AND ce.activo = true
    ORDER BY ce.orden_visualizacion ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.obtener_campos_formulario(integer)
    IS 'Obtiene los campos ordenados para renderizar en formulario dinÃ¡mico.';

-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
-- FIN DEL SCRIPT
-- â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

COMMIT;

``

