-- Semilla de desarrollo local. Se aplica automáticamente tras las migraciones
-- en `supabase db reset` (ver [db.seed] en config.toml).

insert into logias (nombre, numero, oriente) values
  ('Luz y Verdad', 12, 'Villahermosa'),
  ('Renacimiento', 27, 'Cárdenas'),
  ('Hijos del Progreso', 5, 'Comalcalco');

-- Los usuarios se crean al registrarse vía Supabase Auth (trigger handle_new_user).
-- Para asignar el primer administrador en local, tras registrarte:
--   update perfiles set rol='master', estado='validado', grado='maestro' where email='TU_CORREO';
