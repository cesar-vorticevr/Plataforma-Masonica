-- ====================================================================
-- Directorio: denormalizar nombre y logia del miembro en su perfil
-- profesional (opt-in consentido), sin ampliar la RLS de `perfiles`.
-- ====================================================================

alter table perfiles_profesionales add column if not exists nombre text;
alter table perfiles_profesionales add column if not exists logia_id uuid references logias(id);
