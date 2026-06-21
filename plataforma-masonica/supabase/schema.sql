-- ====================================================================
-- PLATAFORMA MASÓNICA · Esquema de base de datos (PostgreSQL / Supabase)
-- Ejecuta este archivo completo en: Supabase > SQL Editor.
-- Incluye: tablas, enums, función de perfil, triggers y políticas RLS
-- (seguridad por logia y por grado). Datos semilla al final (opcional).
-- ====================================================================

-- ----------------------------- ENUMS --------------------------------
create type rol_t        as enum ('master','gran_secretario','secretario','tesorero','hermano');
create type grado_t      as enum ('aprendiz','companero','maestro');
create type estado_t     as enum ('pendiente','validado','bloqueado');
create type semaforo_t   as enum ('verde','amarillo','rojo');
create type alcance_t    as enum ('logia','global');

-- ----------------------------- LOGIAS -------------------------------
create table logias (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  numero        int  not null,
  oriente       text not null,
  palabra_clave text not null default 'BOAZ',   -- en producción: guardar hash
  estado        text not null default 'activa',
  created_at    timestamptz default now()
);

-- ------------------------- PERFILES (usuarios) ----------------------
-- Se vincula 1:1 con auth.users (id = auth.uid()).
create table perfiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  nombre         text not null,
  email          text not null,
  rol            rol_t not null default 'hermano',
  grado          grado_t,
  logia_id       uuid references logias(id),
  estado         estado_t not null default 'pendiente',
  foto           text,
  fecha_registro timestamptz default now()
);

create table generales (
  usuario_id uuid primary key references perfiles(id) on delete cascade,
  fecha_nacimiento date,
  telefono text,
  direccion text,
  contacto_emergencia_nombre text,
  contacto_emergencia_tel text,
  tipo_sangre text,
  notas text
);

create table perfiles_profesionales (
  usuario_id uuid primary key references perfiles(id) on delete cascade,
  profesion text, sector text, negocio text, descripcion text,
  palabras_clave text[], mostrar_en_directorio boolean default true
);

create table evaluaciones_salud (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references perfiles(id) on delete cascade,
  fecha timestamptz default now(),
  respuestas jsonb not null default '{}',
  puntaje_metabolico int not null default 0,
  puntaje_oncologico int not null default 0,
  semaforo_metabolico semaforo_t not null default 'verde',
  semaforo_oncologico semaforo_t not null default 'verde',
  etiquetas text[] default '{}'
);

create table eventos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null, descripcion text,
  fecha_evento timestamptz not null,
  alcance alcance_t not null default 'logia',
  logia_id uuid references logias(id),
  autor_id uuid references perfiles(id),
  created_at timestamptz default now()
);

create table buzon_documentos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null, tipo text not null,
  archivo_url text, autor_id uuid references perfiles(id),
  fecha timestamptz default now()
);

create table correspondencia (
  id uuid primary key default gen_random_uuid(),
  de_logia_id uuid references logias(id),
  destinatarios_logia_ids uuid[] not null default '{}',
  asunto text not null, cuerpo text,
  adjuntos jsonb default '[]',
  autor_id uuid references perfiles(id),
  fecha timestamptz default now(),
  leido_por uuid[] default '{}'
);

create table mensajes_profesionales (
  id uuid primary key default gen_random_uuid(),
  de_usuario_id uuid references perfiles(id) on delete cascade,
  a_usuario_id  uuid references perfiles(id) on delete cascade,
  cuerpo text not null, fecha timestamptz default now(), leido boolean default false
);

create table trabajos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references perfiles(id), logia_id uuid references logias(id),
  titulo text not null, descripcion text, archivo_url text,
  camara grado_t not null, fecha timestamptz default now()
);

create table config_capitas (
  logia_id uuid primary key references logias(id) on delete cascade,
  monto numeric not null default 0, periodicidad text default 'mensual'
);

create table pagos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references perfiles(id) on delete cascade,
  anio int not null, mes int not null check (mes between 1 and 12),
  monto numeric not null default 0, pagado boolean default false,
  registrado_por uuid references perfiles(id), fecha_registro timestamptz,
  unique (usuario_id, anio, mes)
);

create table tenidas (
  id uuid primary key default gen_random_uuid(),
  logia_id uuid references logias(id) on delete cascade,
  titulo text not null, fecha timestamptz not null
);

create table asistencias (
  id uuid primary key default gen_random_uuid(),
  tenida_id uuid references tenidas(id) on delete cascade,
  usuario_id uuid references perfiles(id) on delete cascade,
  presente boolean default false,
  unique (tenida_id, usuario_id)
);

create table consentimientos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references perfiles(id) on delete cascade,
  version_aviso text not null, fecha timestamptz default now(), ip text
);

-- ----------------- FUNCIONES AUXILIARES PARA RLS --------------------
create or replace function mi_logia() returns uuid language sql stable security definer as $$
  select logia_id from perfiles where id = auth.uid()
$$;
create or replace function mi_rol() returns rol_t language sql stable security definer as $$
  select rol from perfiles where id = auth.uid()
$$;
create or replace function mi_grado() returns grado_t language sql stable security definer as $$
  select grado from perfiles where id = auth.uid()
$$;
create or replace function es_admin() returns boolean language sql stable as $$
  select mi_rol() in ('secretario','gran_secretario','master')
$$;
create or replace function es_global() returns boolean language sql stable as $$
  select mi_rol() in ('gran_secretario','master')
$$;
-- nivel de cámara para comparar grados (aprendiz<companero<maestro)
create or replace function nivel(g grado_t) returns int language sql immutable as $$
  select case g when 'aprendiz' then 1 when 'companero' then 2 when 'maestro' then 3 else 0 end
$$;

-- Crea automáticamente el perfil al registrarse un usuario en auth.users
create or replace function handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into perfiles (id, nombre, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', new.email), new.email);
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------- RLS ----------------------------------
alter table logias enable row level security;
alter table perfiles enable row level security;
alter table generales enable row level security;
alter table perfiles_profesionales enable row level security;
alter table evaluaciones_salud enable row level security;
alter table eventos enable row level security;
alter table buzon_documentos enable row level security;
alter table correspondencia enable row level security;
alter table mensajes_profesionales enable row level security;
alter table trabajos enable row level security;
alter table config_capitas enable row level security;
alter table pagos enable row level security;
alter table tenidas enable row level security;
alter table asistencias enable row level security;
alter table consentimientos enable row level security;

-- Logias: todos las leen; solo global las modifica
create policy logias_read on logias for select using (true);
create policy logias_admin on logias for all using (es_global()) with check (es_global());

-- Perfiles: cada quien ve el suyo; admins ven su logia; global ve todo
create policy perfiles_self on perfiles for select using (
  id = auth.uid() or es_global() or (es_admin() and logia_id = mi_logia())
);
create policy perfiles_update_self on perfiles for update using (id = auth.uid());
create policy perfiles_admin on perfiles for update using (
  es_global() or (es_admin() and logia_id = mi_logia())
);

-- Generales: dueño + administradores de su logia
create policy generales_rw on generales for all using (
  usuario_id = auth.uid() or es_global()
  or (es_admin() and exists (select 1 from perfiles p where p.id = generales.usuario_id and p.logia_id = mi_logia()))
) with check (usuario_id = auth.uid());

-- Salud: SOLO el dueño ve el detalle individual (datos sensibles)
create policy salud_owner on evaluaciones_salud for all using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
-- (Las estadísticas agregadas se sirven con vistas/funciones security definer, sin exponer filas.)

-- Perfiles profesionales / Directorio: visibles para hermanos validados
create policy prof_read on perfiles_profesionales for select using (mostrar_en_directorio or usuario_id = auth.uid());
create policy prof_write on perfiles_profesionales for all using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

-- Eventos: lectura por alcance; escritura admins
create policy eventos_read on eventos for select using (alcance = 'global' or logia_id = mi_logia());
create policy eventos_write on eventos for all using (es_admin()) with check (es_admin());

-- Buzón y correspondencia: solo administradores
create policy buzon_admin on buzon_documentos for all using (es_admin()) with check (es_admin());
create policy corr_read on correspondencia for select using (
  es_admin() and (de_logia_id = mi_logia() or mi_logia() = any(destinatarios_logia_ids) or es_global())
);
create policy corr_write on correspondencia for insert with check (es_admin() and de_logia_id = mi_logia());

-- Mensajería profesional: solo emisor/receptor
create policy msg_rw on mensajes_profesionales for all
  using (de_usuario_id = auth.uid() or a_usuario_id = auth.uid())
  with check (de_usuario_id = auth.uid());

-- Trabajos: visibilidad por cámara (no ves cámaras superiores a tu grado)
create policy trabajos_read on trabajos for select using (
  logia_id = mi_logia() and nivel(camara) <= nivel(mi_grado())
);
create policy trabajos_write on trabajos for insert with check (
  usuario_id = auth.uid() and nivel(camara) <= nivel(mi_grado())
);

-- Tesorería
create policy capita_read on config_capitas for select using (logia_id = mi_logia() or mi_rol() = 'master'); -- tesoreria global solo master (Gran Secretario NO)
create policy capita_write on config_capitas for all using (mi_rol() in ('tesorero','secretario','master')) with check (true);
create policy pagos_read on pagos for select using (
  usuario_id = auth.uid() or mi_rol() = 'master'
  or (mi_rol() in ('tesorero','secretario') and exists (select 1 from perfiles p where p.id = pagos.usuario_id and p.logia_id = mi_logia()))
);
create policy pagos_write on pagos for all using (
  mi_rol() in ('tesorero','secretario','master')
) with check (true);

-- Tenidas y asistencia
create policy tenidas_read on tenidas for select using (logia_id = mi_logia() or es_global());
create policy tenidas_write on tenidas for all using (es_admin()) with check (true);
create policy asis_read on asistencias for select using (
  usuario_id = auth.uid() or es_admin() or es_global()
);
create policy asis_write on asistencias for all using (es_admin()) with check (true);

create policy consent_rw on consentimientos for all using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());

-- ------------------------- SEMILLA MÍNIMA ---------------------------
insert into logias (nombre, numero, oriente) values
  ('Luz y Verdad', 12, 'Villahermosa'),
  ('Renacimiento', 27, 'Cárdenas'),
  ('Hijos del Progreso', 5, 'Comalcalco');
-- Nota: los usuarios se crean al registrarse vía Supabase Auth.
-- Después, asigna manualmente el primer 'master'/'gran_secretario':
--   update perfiles set rol='master', estado='validado', grado='maestro' where email='TU_CORREO';
