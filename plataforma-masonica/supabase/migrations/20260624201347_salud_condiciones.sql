-- Alinea evaluaciones_salud con el tipo de la app: padecimientos/condiciones detectados.
alter table evaluaciones_salud add column if not exists condiciones text[] not null default '{}';
