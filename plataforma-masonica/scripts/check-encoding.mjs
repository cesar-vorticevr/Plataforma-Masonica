// Verifica que el código fuente esté libre de mojibake (texto mal codificado).
// Uso:  npm run check:encoding            (escanea todo el repo)
//       node scripts/check-encoding.mjs [ruta]
//
// Detecta las firmas de una doble codificación UTF-8 -> Latin-1 -> UTF-8, como la que corrompió
// lib/health.ts (donde "¿Cuál" se mostraba con una A acentuada delante de cada signo/acento).
// NO reescribe nada: solo detecta, reporta archivo y línea, y sale con código 1 si hay hallazgos
// (para integrarlo en lint/CI).
//
// No prohíbe UTF-8 legítimo (acentos, ¿, ¡): busca las secuencias delatoras del doble-encode.
// Nota: este archivo usa escapes \u en las regex a propósito, para no contener bytes altos ni de
// control literales (que dispararían su propio check).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

// Raíz a escanear: argumento explícito, o la raíz del repo (dos niveles sobre scripts/).
const scriptDir = fileURLToPath(new URL(".", import.meta.url));
const root = process.argv[2] ? process.argv[2] : join(scriptDir, "..", "..");

// Directorios que nunca se inspeccionan (dependencias, artefactos de build, control de versiones).
// `openspec` se excluye porque sus artefactos de planificación citan mojibake como ejemplo a
// propósito (documentan esta misma verificación) y no son código/contenido que se envíe.
const DIRS_EXCLUIDOS = new Set([
  "node_modules", ".next", ".git", "dist", "coverage", "build", ".turbo", ".vercel", "openspec",
]);

// Extensiones de texto/código que sí se inspeccionan.
const EXTS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".sql", ".md", ".mdx",
  ".json", ".css", ".scss", ".html", ".yml", ".yaml", ".txt", ".env",
]);

// Firmas de mojibake:
//  - Par doble-encode: un char del rango Latin-1 supplement (0xC2-0xDF: Â, Ã, …) seguido de un
//    char en 0x80-0xBF. En español bien codificado los acentos van seguidos de ASCII, así que este
//    par solo aparece tras una doble codificación (incluidas mayúsculas acentuadas con control C1).
//  - Caracteres de control C1 (0x80-0x9F) sueltos, que nunca deben aparecer en fuente de texto.
const PAR_MOJIBAKE = /[\u00C2-\u00DF][\u0080-\u00BF]/;
const CONTROL_C1 = /[\u0080-\u009F]/;

/** Recorre recursivamente `dir` acumulando rutas de archivos de texto candidatos. */
function listarArchivos(dir, acc) {
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    if (entrada.isDirectory()) {
      if (DIRS_EXCLUIDOS.has(entrada.name)) continue;
      listarArchivos(join(dir, entrada.name), acc);
    } else if (entrada.isFile()) {
      if (EXTS.has(extname(entrada.name).toLowerCase())) acc.push(join(dir, entrada.name));
    }
  }
  return acc;
}

/** Devuelve los hallazgos ({ linea, texto }) de un archivo, o [] si está limpio. */
function revisarArchivo(ruta) {
  const contenido = readFileSync(ruta, "utf8");
  const hallazgos = [];
  contenido.split("\n").forEach((linea, i) => {
    if (PAR_MOJIBAKE.test(linea) || CONTROL_C1.test(linea)) {
      hallazgos.push({ linea: i + 1, texto: linea.trim().slice(0, 100) });
    }
  });
  return hallazgos;
}

function main() {
  if (!statSync(root).isDirectory()) {
    console.error(`check:encoding — ruta no válida: ${root}`);
    process.exit(2);
  }

  const archivos = listarArchivos(root, []);
  let total = 0;

  for (const ruta of archivos) {
    for (const h of revisarArchivo(ruta)) {
      total++;
      console.error(`${relative(root, ruta)}:${h.linea}: ${h.texto}`);
    }
  }

  if (total > 0) {
    console.error(`\ncheck:encoding — ${total} hallazgo(s) de mojibake en ${archivos.length} archivo(s) revisado(s).`);
    console.error("Corrige la codificación (UTF-8) de las líneas indicadas antes de continuar.");
    process.exit(1);
  }

  console.log(`check:encoding — OK (${archivos.length} archivos revisados, sin mojibake).`);
}

main();
