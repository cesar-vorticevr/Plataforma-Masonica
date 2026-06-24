-- Semilla de desarrollo local. Se aplica automáticamente tras las migraciones
-- en `supabase db reset` (ver [db.seed] en config.toml).

-- Palabra clave general de la Orden (demo: BOAZ), hasheada.
insert into config (id, palabra_general_hash) values (1, extensions.crypt(lower('BOAZ'), extensions.gen_salt('bf')))
  on conflict (id) do nothing;

-- Logias con su palabra clave hasheada (demo: BOAZ). Cada secretario la cambia luego.
insert into logias (nombre, numero, oriente, palabra_clave) values
  ('Luz y Verdad', 12, 'Villahermosa', extensions.crypt(lower('BOAZ'), extensions.gen_salt('bf'))),
  ('Renacimiento', 27, 'Cárdenas', extensions.crypt(lower('BOAZ'), extensions.gen_salt('bf'))),
  ('Hijos del Progreso', 5, 'Comalcalco', extensions.crypt(lower('BOAZ'), extensions.gen_salt('bf')));

-- Los usuarios se crean al registrarse vía Supabase Auth (trigger handle_new_user).
-- Para asignar el primer administrador en local, tras registrarte:
--   update perfiles set rol='master', estado='validado', grado='maestro' where email='TU_CORREO';
