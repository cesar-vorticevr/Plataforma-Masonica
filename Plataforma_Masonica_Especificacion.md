Plataforma Masónica – Gran Logia Restauración 

Muy Respetable Gran Logia de Estado **“RESTAURACIÓN”** 

_Por la Unidad y el Progreso_ 

## **Plataforma Masónica Integral** 

‑ Especificación Técnico Funcional para Desarrollo 

Documento de requisitos para el equipo de desarrollo Versión 1.0  ·  Junio 2026 

Base: Proyecto Salud Integral (Gran Comisión de Superación Personal) 

Página _1_ de _17_ 

Plataforma Masónica – Gran Logia Restauración 

## **Contenido** 

Página _2_ de _17_ 

Plataforma Masónica – Gran Logia Restauración 

## **1. Resumen ejecutivo** 

Este documento define, de forma completa y lista para entregar a un equipo de desarrollo, la plataforma digital de la Gran Logia de Estado “Restauración”. El propósito es administrar de manera centralizada y segura los datos de los hermanos de todas las logias jurisdiccionadas, partiendo de la idea original de un censo de salud (Proyecto Salud Integral, junio‑noviembre 2026) y ampliándola a una plataforma integral de gestión masónica. 

La plataforma cubre: registro y autenticación controlada por palabra clave y validación del secretario de cada logia; evaluación orientativa de salud con histórico y etiquetas de riesgo; datos generales de contacto; directorio profesional con mensajería interna; eventos y anuncios; buzón interlogial y correspondencia masónica digital; trabajos, burilados y trazados filtrados por cámara; tesorería y control de cápitas; calendario de tenidas y asistencia; y un panel de cumplimientos para cada hermano. Todo bajo un esquema de roles jerárquicos y conforme a la nueva Ley Federal de Protección de Datos Personales en Posesión de los Particulares (vigente desde marzo de 2025). 

**Nota importante sobre el módulo de salud:** la plataforma no emite diagnósticos médicos. Ofrece una evaluación orientativa de factores de riesgo (tamizaje) que debe ser validada por un médico (la Gran Comisión de Superación Personal) y acompañarse siempre de la leyenda de que no sustituye una consulta médica. 

## **2. Objetivo y alcance** 

## **2.1 Objetivo general** 

Construir una plataforma web (con visión a app móvil) que permita a la Gran Logia y a cada logia administrar el padrón de hermanos, su salud preventiva, su situación administrativa (cápitas y asistencias) y la comunicación institucional, con control de accesos por logia y por grado. 

## **2.2 Alcance** 

La solución se dimensiona para crecimiento estatal: más de 30 logias y posibilidad de incorporar nuevas, con miles de hermanos. Esto exige desde el inicio una arquitectura multi‑logia con aislamiento de datos por logia y por grado, control de roles robusto y capacidad de reportes agregados. 

## **2.3 Fuera de alcance (por ahora)** 

- Expedición de credenciales físicas o pasaporte masónico interjurisdiccional (existe ya la app de terceros “Amity” referida en el sitio; se puede evaluar después). 

- Pasarela de pagos en línea de cápitas (en una primera etapa el tesorero solo registra pagos; la cobranza en línea es una mejora futura). 

- Telemedicina o expediente clínico formal. El módulo de salud es preventivo y orientativo. 

Página _3_ de _17_ 

Plataforma Masónica – Gran Logia Restauración 

## **3. Glosario y supuestos** 

|**Término**|**Significado en la plataforma**|
|---|---|
|**Hermano (HH)**|Usuario miembro de una logia. Tiene un grado y pertenece a una logia.|
|**Logia**|Unidad organizativa. Cada una tiene su propia palabra clave de registro y su<br>secretario.|
|**Grado / Cámara**|Aprendiz, Compañero o Maestro. Define qué trabajos puede ver el hermano.|
|**Trabajo / Burilado / Trazado**|Documento de estudio que sube el hermano según su cámara<br>(Aprendiz=Trabajo, Compañero=Burilado, Maestro=Trazado).|
|**Tenida**|Sesión o reunión de la logia. Genera lista de asistencia.|
|**Cápita**|Cuota periódica que paga cada hermano. La administra el tesorero.|
|**Validación**|Acto por el cual el secretario confirma que el hermano está correctamente inscrito<br>y le asigna su grado, habilitando el acceso completo.|
|**4. Roles y matriz de permisos**||
|**4.1 Jerarquía de roles**<br>La plataforma define una cadena de mando que refleja la estructura masónica: los creadores<br>administran a la Gran Secretaría; la Gran Secretaría administra a los secretarios; cada<br>secretario administra a los hermanos de su logia.||
|**Rol**|**Descripción y ámbito**|
|**Administrador Master**<br>**(creadores)**|Máximo control técnico. Gestiona la cuenta del Gran Secretario, parámetros<br>globales, catálogos y soporte. Ámbito: toda la plataforma.|
|**Gran Secretario**|Administrador general de los secretarios. Da de alta logias y secretarios, ve datos<br>agregados de todas las logias y coordina permisos. Ámbito: todas las logias.|
|**Secretario / Administrador**<br>**de logia**|Administra su logia: valida hermanos, asigna grado, bloquea, cambia la palabra<br>clave de su logia, publica eventos, gestiona tenidas y correspondencia. Ámbito:<br>su logia.|
|**Tesorero**|Acceso especial otorgado por el secretario. Gestiona cápitas, pagos y<br>recaudación. Ámbito: su logia.|
|**Hermano validado**|Acceso completo a su perfil y a los módulos según su grado (trabajos, directorio,<br>eventos, cumplimientos).|
|**Hermano no validado**|Acceso restringido: sólo puede llenar Generales y Salud mientras el secretario lo<br>valida.|



## **4.2 Matriz de permisos** 

_Convención: Sí = acceso total; Prop = sólo sus propios datos; Logia = limitado a su logia; Agreg = sólo datos agregados/anonimizados; No = sin acceso._ 

|**Función**|**Hno. no**<br>**valid.**|**Hno.**<br>**validado**|**Tesorero**|**Secretario**|**Gran Secret.**|**Master**|
|---|---|---|---|---|---|---|
|**Llenar Generales**|Prop|Prop|Prop|Logia|Agreg|Sí|
|**Llenar Salud**|Prop|Prop|Prop|Agreg|Agreg|Agreg|
|**Ver Generales de otros**|No|No|No|Logia|Agreg|Sí|
|**Directorio profesional**|No|Sí|Sí|Sí|Sí|Sí|



Página _4_ de _17_ 

Plataforma Masónica – Gran Logia Restauración 

|**Mensajería profesional**|No|Sí|Sí|Sí|Sí|Sí|
|---|---|---|---|---|---|---|
|**Ver Eventos**|No|Sí|Sí|Sí|Sí|Sí|
|**Publicar Eventos**|No|No|No|Logia|Sí|Sí|
|**Buzón interlogial**|No|No|No|Sí|Sí|Sí|
|**Correspondencia entre**<br>**secret.**|No|No|No|Sí|Sí|Sí|
|**Subir Trabajos (su cámara)**|No|Sí|Sí|Sí|Sí|Sí|
|**Ver Trabajos (según grado)**|No|Sí|Sí|Sí|Sí|Sí|
|**Tesorería / cápitas**|No|No|Logia|Logia|Agreg|Sí|
|**Calendario de tenidas /**<br>**asist.**|No|No|No|Logia|Agreg|Sí|
|**Ver mis Cumplimientos**|No|Prop|Prop|Logia|Agreg|Sí|
|**Validar / asignar grado /**<br>**bloquear**|No|No|No|Logia|Sí|Sí|
|**Cambiar palabra clave de**<br>**logia**|No|No|No|Logia|Sí|Sí|
|**Alta de logias y secretarios**|No|No|No|No|Sí|Sí|



_Recomendación de privacidad: ni el Gran Secretario ni el Secretario deben ver el detalle de salud individual de un hermano. Sólo deben acceder a estadísticas agregadas y a las etiquetas de riesgo anonimizadas, para planear acciones preventivas sin exponer datos sensibles personales._ 

Página _5_ de _17_ 

Plataforma Masónica – Gran Logia Restauración 

## **5. Módulos funcionales** 

## **5.1 Registro y autenticación** 

El acceso a la plataforma siempre pide iniciar sesión o registrarse. El registro es controlado en dos niveles para garantizar que sólo ingresen hermanos verdaderos. 

## **Flujo de registro** 

1. La persona ingresa la palabra clave general de la Orden (inicialmente BOAZ). La comparación es insensible a mayúsculas/minúsculas (boaz, BOAZ y Boaz se aceptan). 

2. Selecciona la logia a la que desea registrarse, de un catálogo de logias. 

3. Ingresa la palabra clave específica de esa logia (inicialmente también BOAZ, pero cada secretario puede cambiarla desde la plataforma para controlar accesos). 

4. Crea su cuenta con correo y contraseña (con confirmación de contraseña), o bien con su cuenta de Google (inicio de sesión con Google) para mayor facilidad. 

5. Queda registrado y entra directo a la plataforma, pero en estado “no validado”: sólo puede llenar Generales y Salud. 

6. El secretario de la logia lo valida, le asigna su grado y, con ello, se habilita el acceso completo según su cámara. 

**Seguridad de las palabras clave:** la palabra clave general y la de cada logia deben guardarse cifradas (hash), no en texto plano. Son una primera barrera de bajo nivel (secreto compartido); la verdadera seguridad la da la validación del secretario. Se recomienda no reutilizar BOAZ de forma permanente: que cada secretario fije una palabra propia. 

## **Estados de la cuenta** 

- Pendiente / no validado: acceso sólo a Generales y Salud. 

- Validado: acceso completo según grado. 

- Bloqueado: el secretario puede bloquear a un usuario; pierde acceso sin borrar sus datos. 

## **5.2 Módulo de Salud** 

Cada hermano responde un cuestionario de factores de riesgo. La plataforma calcula una evaluación orientativa (no un diagnóstico médico) y la presenta en un tablero personal. 

## **Características** 

- El cuestionario se puede llenar varias veces en fechas distintas; cada llenado queda registrado con su fecha. 

- Al volver a llenarlo, el tablero compara contra los llenados anteriores e indica la mejora (o el deterioro) en cada bloque de riesgo. 

- La plataforma genera automáticamente etiquetas de riesgo (por ejemplo: tabaquismo, sedentarismo, obesidad, antecedente_familiar_cáncer, riesgo_metabólico_alto) que permiten a los administradores detectar y planear acciones preventivas de forma agregada. 

- Tablero personal (dashboard) con: semáforo de riesgo por bloque, historial en línea de tiempo, recomendaciones generales y la leyenda de que no sustituye consulta médica. 

Página _6_ de _17_ 

Plataforma Masónica – Gran Logia Restauración 

La lógica detallada de puntajes y semáforo se propone en la sección 6 y el contenido del cuestionario en el Anexo A. 

## **5.3 Módulo de Generales** 

Datos de contacto e información útil del hermano: fecha de nacimiento, teléfono, contacto de emergencia y otros datos de localización. Estos datos son visibles únicamente para administradores y secretarios (de su propia logia), nunca para el resto de los hermanos. 

## **5.4 Perfil profesional y Directorio** 

Todos los hermanos llenan un Perfil Profesional para indicar a qué se dedican (profesión, negocio, sector, descripción de servicios y palabras clave). El Directorio Profesional lista las profesiones y negocios disponibles e incluye un buscador por palabras clave. 

**Privacidad del directorio:** en el directorio sólo se muestran el nombre del hermano, su logia y sus datos profesionales. No se muestran datos de contacto (teléfono, correo). El contacto se hace exclusivamente a través de la mensajería interna de la plataforma. 

## **5.5 Mensajería profesional interna** 

Buzón dentro de la plataforma para que los hermanos se contacten entre sí únicamente para fines profesionales, a partir del directorio. Permite enviar mensajes sin exponer datos de ‑ contacto personales. Debe contemplar reglas anti abuso (reportar, bloquear) y registro de la conversación. 

## **5.6 Eventos y anuncios** 

Los secretarios publican anuncios de eventos dirigidos a su logia o a todas las logias. Los eventos aparecen en la sección de Eventos de la plataforma. Esta sección sólo es editable por secretarios (y superiores); los hermanos sólo la consultan. 

## **5.7 Buzón interlogial** 

Repositorio donde se suben documentos en PDF y Word para que puedan ser vistos y leídos por cada secretario. Sirve como archivo compartido entre secretarías de las distintas logias. 

## **5.8 Correspondencia masónica digital** 

Mensajería formal entre secretarios de varias logias, con registro de fechas, para que la correspondencia sea digital. Permite enviar texto y adjuntar archivos (PDF, Word) e imágenes (PNG y JPG). Cada envío queda fechado y trazable. Es la versión “oficial” y dirigida del buzón interlogial. 

## **5.9 Trabajos, Burilados y Trazados** 

Sección para compartir trabajos de estudio. El tipo depende del grado del autor: Trabajos (Aprendices), Burilados (Compañeros) y Trazados (Maestros). Al subir un documento, el hermano selecciona la cámara a la que pertenece su trabajo. 

**Regla de visibilidad por cámara (crítica):** cada hermano sólo ve los trabajos de su cámara y de las inferiores. Un Aprendiz ve sólo Aprendiz; un Compañero ve Aprendiz y Compañero; un 

Página _7_ de _17_ 

Plataforma Masónica – Gran Logia Restauración 

Maestro ve los tres grados. Esta validación de acceso debe hacerse en el servidor, no sólo en la interfaz. 

Este módulo sólo está disponible para hermanos validados (con grado asignado por el secretario). 

## **5.10 Tesorería y cápitas** 

El secretario otorga acceso especial al tesorero. El tesorero cuenta con un tablero donde marca casillas para registrar los meses ya pagados por cada hermano y define el monto de las cápitas en la plataforma. 

- Tablero con casillas por hermano y por mes/periodo para marcar pagado / no pagado. 

- Configuración del monto de cápita (por logia y periodo). 

- Indicadores: total recaudado, porcentaje de cumplimiento, adeudos por hermano y por logia. 

## **5.11 Calendario de tenidas y asistencia** 

El secretario administra un calendario de tenidas. Al dar clic en una tenida aparece el listado de todos los hermanos registrados en esa logia, con casillas para marcar la asistencia. 

- Tablero con asistencias por mes, en porcentaje, por hermano y por logia, por mes y por año. 

- Permite ver tendencias de participación a lo largo del tiempo. 

## **5.12 Cumplimientos (vista del hermano)** 

Cada hermano tiene acceso a una sección de Cumplimientos donde ve cómo va con sus pagos y asistencias: sus porcentajes de cumplimiento y cuánto debe. Es la cara “personal” de los módulos de tesorería y asistencia. 

## **5.13 Administración y gestión de accesos** 

La plataforma debe permitir coordinar los accesos dentro de la propia plataforma siguiendo la cadena de mando descrita en la sección 4. Acciones clave: 

- El secretario (admin de logia) puede: editar ciertos campos del usuario nuevo, validarlo, asignarle su grado, bloquearlo, cambiar la palabra clave de su logia, dar acceso de tesorero, y ver los generales y datos grupales de su logia. 

- El Gran Secretario gestiona el alta de logias y de secretarios, y ve datos agregados de todas las logias. 

- El Administrador Master (creadores) gestiona la cuenta del Gran Secretario, parámetros globales, catálogos (logias, grados, etiquetas), respaldos y soporte. 

_Se recomienda definir con precisión qué campos puede editar el admin de logia (ver Decisiones abiertas) y registrar todas las acciones administrativas en una bitácora de auditoría._ 

Página _8_ de _17_ 

Plataforma Masónica – Gran Logia Restauración 

## **6. Lógica propuesta de la evaluación de salud (v1 orientativa)** 

**Aviso:** esta es una primera propuesta para que el médico de la Gran Comisión la revise y ajuste. No es un diagnóstico ni un instrumento clínico validado. Se basa en el cuestionario del Proyecto Salud Integral y en herramientas de tamizaje de uso común. 

Se proponen tres bloques de riesgo independientes, cada uno con un semáforo (Verde = bajo, Amarillo = moderado, Rojo = alto), más un módulo educativo de detección de ictus (FAST) que no se promedia porque es una emergencia. 

## **6.1 Bloque metabólico (diabetes, hipertensión y obesidad)** 

Inspirado en cuestionarios tipo FINDRISC. Cada ítem suma puntos; el total define el semáforo. 

|**Factor**|**Condición**|**Puntos**|
|---|---|---|
|Edad|45–54 / 55–64 /<br>65+|2 / 3 / 4|
|Índice de masa corporal (IMC)|25–30 / >30|1 / 3|
|Perímetro de cintura elevado|Sí|3–4|
|Inactividad física (sedentarismo)|Sí|2|
|Dieta baja en frutas y verduras|Sí|1|
|Toma medicación para la presión|Sí|2|
|Glucosa elevada detectada antes|Sí|5|
|Antecedente familiar de diabetes|Sí|3–5|
|**Resultado**|**Semáforo**||
|Total < 7|Verde – riesgo bajo||
|Total 7 a 14|Amarillo – riesgo moderado||
|Total ≥ 15|Rojo – riesgo alto: valoración médica||



## **6.2 Bloque oncológico** 

Se basa en las 12 preguntas Sí/No del cuestionario del documento (Anexo A). Cada “Sí” suma 1 punto; el antecedente familiar de cáncer a edad temprana (antes de los 50) pondera 2 puntos. Los síntomas de alarma (bultos, cambios en lunares, pérdida de peso inexplicable, sangrados) elevan automáticamente a Rojo. 

|**Resultado**|**Semáforo**|
|---|---|
|0 a 2 puntos, sin síntomas de alarma|Verde – riesgo bajo|
|3 a 5 puntos|Amarillo – vigilancia y hábitos|
|≥ 6 puntos o cualquier síntoma de alarma|Rojo – acudir a valoración|



## **6.3 Bloque de hábitos / estilo de vida** 

Tabaquismo, consumo de alcohol, actividad física y dieta. Alimenta a los dos bloques anteriores y genera etiquetas propias (tabaquismo, alcohol, sedentarismo) para acciones de promoción de la salud. 

Página _9_ de _17_ 

Plataforma Masónica – Gran Logia Restauración 

## **6.4 Módulo FAST (detección de ictus)** 

Contenido educativo permanente (no es puntaje): Rostro caído, Brazo débil, dificultad del Habla, Tiempo de actuar. Si se presenta cualquiera de estos signos, llamar o trasladar de inmediato a servicios médicos. Se muestra como tarjeta informativa de emergencia. 

## **6.5 Etiquetas de riesgo generadas** 

La plataforma debe generar etiquetas a partir de las respuestas, almacenadas por hermano y por fecha, para que los administradores las exploten de forma agregada y anonimizada. Ejemplos: 

- **Metabólicas:** riesgo_metabólico_alto, obesidad, sobrepeso, glucosa_elevada, hipertensión_referida. 

- **Oncológicas:** antecedente_familiar_cáncer, síntoma_de_alarma, exposición_ocupacional. 

- **Hábitos:** tabaquismo, alcohol, sedentarismo, dieta_baja_frutas_verduras. 

Página _10_ de _17_ 

Plataforma Masónica – Gran Logia Restauración 

## **7. Modelo de datos (entidades principales)** 

Modelo conceptual para orientar al desarrollador. Los nombres son sugerencias; el diseño físico final lo definirá el equipo técnico. 

|**Entidad**|**Campos clave**|
|---|---|
|**Logia**|id, nombre, número, oriente, palabra_clave_hash, secretario_id, estado.|
|**Usuario / Hermano**|id, nombre_completo, email, password_hash, google_id, foto, logia_id, grado, rol,<br>estado (pendiente/validado/bloqueado), fecha_registro, validado_por,<br>fecha_validación.|
|**Generales**|usuario_id, fecha_nacimiento, teléfono, contacto_emergencia_nombre,<br>contacto_emergencia_tel, otros_datos.|
|**PerfilProfesional**|usuario_id, profesión, sector, descripción, palabras_clave, mostrar_en_directorio.|
|**EvaluacionSalud**|id, usuario_id, fecha, respuestas_json, puntaje_metabólico, puntaje_oncológico,<br>semáforos, etiquetas[].|
|**Evento**|id, título, descripción, fecha_evento, alcance (logia/global), logia_id, autor_id,<br>adjuntos[].|
|**DocumentoBuzon**|id, título, archivo, tipo (pdf/word), autor_id, fecha, alcance.|
|**Correspondencia**|id, de_logia, destinatarios[], asunto, cuerpo, adjuntos[] (pdf/word/png/jpg), fecha,<br>leído_por[].|
|**MensajeProfesional**|id, de_usuario, a_usuario, asunto, cuerpo, fecha, leído, reportado.|
|**Trabajo**|id, usuario_id, logia_id, título, archivo, cámara (aprendiz/compañero/maestro),<br>fecha.|
|**Capita (config)**|id, logia_id, periodo, monto, vigente_desde.|
|**Pago**|id, usuario_id, periodo (mes/año), monto, pagado, fecha_registro, registrado_por.|
|**Tenida**|id, logia_id, fecha, título.|
|**Asistencia**|id, tenida_id, usuario_id, presente.|
|**Consentimiento**|id, usuario_id, versión_aviso, fecha_aceptación, ip.|
|**Auditoría**|id, usuario_id, acción, entidad, fecha, detalle.|



## **8. Seguridad, privacidad y cumplimiento legal** 

La plataforma maneja datos personales y, en el módulo de salud, datos personales sensibles. En México rige desde el 21 de marzo de 2025 la nueva Ley Federal de Protección de Datos Personales en Posesión de los Particulares, cuyo órgano regulador es la Secretaría Anticorrupción y Buen Gobierno (ya no el INAI). Esto obliga a: 

- **Aviso de privacidad:** documento disponible para el titular desde el momento en que se recaban sus datos, que identifique los datos sensibles y las finalidades, e incluya los mecanismos para ejercer los derechos ARCO (acceso, rectificación, cancelación y oposición) y para revocar el consentimiento. 

- **Consentimiento expreso y por escrito** para los datos de salud (sensibles). En la plataforma se implementa como una casilla de aceptación del aviso de privacidad, registrada con fecha y versión, antes de llenar el módulo de Salud. 

Página _11_ de _17_ 

Plataforma Masónica – Gran Logia Restauración 

- **Datos de salud como sensibles:** la ley considera sensible el estado de salud presente o futuro. Las sanciones por mal manejo pueden duplicarse cuando se trata de datos sensibles. 

La Gran Logia (a través de la Gran Secretaría) sería el “responsable” de los datos y debe designar a una persona o área encargada. El texto legal del aviso debe redactarlo o revisarlo un abogado (ver Decisiones abiertas). 

## **8.1 Medidas técnicas recomendadas** 

- Cifrado en tránsito (HTTPS/TLS obligatorio) y cifrado en reposo de la base de datos y los archivos. 

- Contraseñas y palabras clave guardadas con hash fuerte (bcrypt/argon2), nunca en texto plano. 

- Control de acceso basado en roles aplicado en el servidor (no sólo en la interfaz), con aislamiento por logia y por grado. 

- Segundo factor de autenticación (2FA) recomendado para secretarios, tesoreros y Gran Secretario. 

- Bitácora de auditoría de acciones administrativas y de accesos a datos sensibles. 

- Respaldos periódicos y política de retención; minimización de datos (recabar sólo lo necesario). 

- Acceso a salud individual restringido al propio hermano; los administradores sólo ven datos agregados/anonimizados. 

Página _12_ de _17_ 

Plataforma Masónica – Gran Logia Restauración 

## **9. Recomendaciones de tecnología y hosting** 

‑ Tres caminos viables para una solución multi logia de crecimiento estatal. La decisión final corresponde al hermano programador según su experiencia. El sitio actual de la Gran Logia está en WordPress, y ya cuentan con dominio (restauracion.org.mx) y correo propio, lo que facilita alojar la plataforma en un subdominio (por ejemplo, plataforma.restauracion.org.mx). 

|**Opción**|**Stack**|**Pros / contras**|
|---|---|---|
|**A –**<br>**Recomendada**<br>**para arrancar**<br>**rápido**|Frontend React/Next.js + Supabase<br>(PostgreSQL gestionado, autenticación con<br>email y Google incluida, almacenamiento de<br>archivos, seguridad a nivel de fila). Hosting en<br>Vercel.|+ La seguridad por fila encaja perfecto con<br>permisos por logia y por grado. + Login con<br>Google ya incluido. + Muy rápido de construir,<br>escalable. – Dependencia de proveedor.|
|**B –**<br>**Familiaridad**<br>**PHP**|Laravel (PHP) + MySQL/PostgreSQL en un<br>VPS. Útil si el hermano ya domina PHP (como<br>el WordPress actual).|+ Control total, ecosistema maduro, familiar. –<br>Hay que implementar a mano la<br>autenticación, permisos y la integración con<br>Google. Más mantenimiento de servidor.|
|**C – Robusta y**<br>**escalable**|Node.js (NestJS) o Django + PostgreSQL +<br>React, en contenedores (Docker), desplegado<br>en Railway/Render o nube (AWS/GCP).|+ Máxima escalabilidad y control para<br>crecimiento estatal. – Mayor esfuerzo inicial y<br>se requiere más experiencia DevOps.|



## **9.1 Costos aproximados (referencia)** 

## 

- Opción A: capa gratuita para empezar; planes de pago desde ~25 USD/mes (Supabase) y ~20 USD/mes (Vercel) al crecer. Aprox. 800–1,000 MXN/mes en régimen. 

- Opciones B y C: VPS desde ~10–40 USD/mes (aprox. 200–800 MXN/mes) más tiempo de administración del servidor. 

- Dominio y correo: ya los poseen; el subdominio no tiene costo adicional. 

## **9.2 Sobre construir aquí vs. en otra herramienta** 

Esta sesión es ideal para producir la especificación, prototipos navegables (maquetas HTML clicables) y bocetos de pantallas que ayuden a alinear la visión. El desarrollo de la aplicación productiva —con base de datos real, autenticación y despliegue— conviene que lo realice el hermano programador en uno de los stacks anteriores, usando este documento como guía. Si lo deseas, el siguiente paso aquí puede ser una maqueta visual navegable de las pantallas principales. 

## **10. Plan por fases (roadmap sugerido)** 

|**Fase**|**Entregable**|**Contenido**|
|---|---|---|
|**Fase 0**|Definiciones|Catálogo de logias y grados, designar<br>administradores, validación médica del cuestionario,<br>aviso de privacidad legal.|
|**Fase 1 (MVP)**|Censo + identidad|Registro/login (palabra clave + Google), validación por<br>secretario, Generales y Salud con histórico y<br>etiquetas. Cumple el objetivo original del censo.|
|**Fase 2**|Administración|Tesorería y cápitas, calendario de tenidas y<br>asistencia, panel de Cumplimientos del hermano.|



Página _13_ de _17_ 

Plataforma Masónica – Gran Logia Restauración 

|**Fase 3**|Comunicación|Eventos, buzón interlogial, correspondencia masónica<br>digital, Trabajos/Burilados/Trazados por cámara.|
|---|---|---|
|**Fase 4**|Red profesional|Perfil profesional, directorio con buscador y<br>mensajería profesional interna.|
|**Fase 5**|Mejoras|Reportes y exportación, refinamientos, app móvil,<br>posible cobranza en línea.|



Página _14_ de _17_ 

Plataforma Masónica – Gran Logia Restauración 

## **11. Decisiones abiertas — qué más necesitamos definir** 

Para que el hermano programador pueda construir sin bloqueos, conviene resolver estos puntos. Son las piezas que aún faltan: 

   7. Catálogo oficial de logias: nombres, números y orientes, y quién es el secretario de cada una (para crear sus cuentas). 

   8. Catálogo de grados y cámaras: confirmar Aprendiz / Compañero / Maestro y si se manejarán grados filosóficos o cargos adicionales. 

   9. Validación médica del cuestionario de salud: que un médico de la Gran Comisión revise preguntas, puntajes y textos, y autorice la leyenda de deslinde de responsabilidad. 

   10. Aviso de privacidad: redacción/revisión por abogado conforme a la ley 2025, y designación del responsable de datos. 

   11. Reglas de cápita: montos, periodicidad (mensual/otra), si varían por logia o por grado, y manejo de adeudos históricos. 

   12. Campos editables por el admin de logia: lista exacta de qué puede modificar del usuario nuevo. 

   13. Reglas de visibilidad finas: confirmar que los administradores sólo ven salud agregada/anonimizada (recomendado) y no individual. 

   14. Hospedaje y responsable técnico: quién contrata y paga el servidor/servicios y administra la cuenta. 

   15. Política de archivos: tamaño máximo y tipos permitidos (PDF, Word, PNG, JPG) en buzón, correspondencia y trabajos. 

   16. Bajas y postmortem: qué ocurre con los datos de un hermano que fallece o se retira (la web ya tiene sección PostMortem). 

   17. Identidad visual: usar el logo y los colores institucionales de la Gran Logia (ya disponibles en el sitio). 

   18. Reportes: qué tableros y exportaciones (Excel/PDF) necesitan el Gran Secretario, secretarios y tesoreros. 

   19. Decisión construir a medida vs. usar plataforma existente: valorar si la app de terceros “Amity” (referida en el sitio) cubre parte del alcance o si todo será a medida. 

- **11.1 Sugerencias adicionales (por si se pasaron)** 

   - Notificaciones por correo (validación aprobada, nuevo evento, nueva correspondencia, recordatorio de cápita). 

   - Soporte móvil desde el diseño (responsive) aunque la app nativa sea posterior. 

   - Buscador global y filtros en directorio, trabajos y correspondencia. 

   - Panel de estadísticas de salud agregadas para la Gran Comisión (objetivo original del Proyecto Salud Integral): prevalencia de etiquetas por oriente/logia, anonimizada. 

   - Idioma español y formato de fechas MX; accesibilidad básica. 

   - Términos de uso además del aviso de privacidad. 

Página _15_ de _17_ 

Plataforma Masónica – Gran Logia Restauración 

## **Anexo A. Contenido del cuestionario de salud (base)** 

Tomado del Proyecto Salud Integral de la Gran Comisión de Superación Personal. Es la base a digitalizar y a validar por el médico. 

## **A.1 Detección de ictus – prueba FAST (informativa)** 

- Rostro (Face): pedir que sonría; ¿un lado de la cara está caído o adormecido? 

- Brazos (Arms): pedir que levante ambos brazos; ¿uno se debilita y cae? 

- Habla (Speech): pedir que repita una frase sencilla; ¿arrastra las palabras o no puede repetirla? 

- Tiempo (Time): ante cualquier signo, llamar o trasladar de inmediato a servicios médicos. 

## **A.2 Riesgo oncológico (preguntas Sí/No)** 

## **Antecedentes familiares** 

- ¿Tienes familiares directos (padres, hermanos o hijos) diagnosticados con algún tipo de cáncer? 

- ¿Algún familiar cercano desarrolló cáncer de mama, ovario, colon o próstata antes de los 50 años? 

## **Estilo de vida** 

- ¿Fumas actualmente o has fumado regularmente en el pasado? 

- ¿Consumes bebidas alcohólicas de forma frecuente? 

- ¿Tienes un estilo de vida sedentario o dieta baja en frutas y verduras? 

- ¿Has estado expuesto al sol sin protección o a sustancias químicas tóxicas en tu trabajo? 

## **Síntomas de alarma** 

- ¿Pérdida de peso inexplicable (más de 4.5 kg) en los últimos meses? 

- ¿Fatiga extrema y constante que no mejora con el descanso? 

- ¿Dolor persistente o fiebre recurrente sin causa aparente? 

- ¿Bultos nuevos o engrosamiento de la piel (especialmente en los senos)? 

- ¿Cambio en tamaño, forma o color de un lunar o mancha? 

- ¿Tos persistente, dificultad para respirar o cambios en la voz por más de dos semanas? 

- ¿Cambios inusuales en hábitos intestinales o urinarios (sangre, dolor, estreñimiento o diarrea constante)? 

## **A.3 Síndrome metabólico (estudios sugeridos)** 

Para quienes resulten en amarillo/rojo, el documento sugiere: glucosa en ayunas, perfil de lípidos, hemoglobina glucosilada, insulina basal; y mediciones clínicas: cintura, presión arterial, electrocardiograma y tele de tórax en factor de riesgo. Estas son recomendaciones para acudir al médico, no estudios que realice la plataforma. 

Página _16_ de _17_ 

Plataforma Masónica – Gran Logia Restauración 

_Documento preparado para entregar al equipo de desarrollo. No sustituye asesoría legal ni médica; el aviso de privacidad y la lógica de salud deben ser validados por un abogado y un médico, respectivamente._ 

Página _17_ de _17_ 

