# Estado de Implementacion del Hub Clinico HS Valme

## Resumen

| Aspecto | Estado |
|---|---|
| Fases completadas | 1, 2, 3, 4 |
| Rama | `feature/hce-unified-clinical-tool` |
| Entrada del hub | `HCE/hs_valme_hub/index.html` |
| Salida de build | `HCE/hs_valme_hub/dist/` |
| Persistencia de datos | Ninguna (solo memoria de sesion) |

## Que se ha construido

El Hub Clinico HS Valme es una aplicacion estatica de cuatro rutas:

1. **Registrar visita**: formularios de primera visita y seguimiento.
2. **Ver paciente**: evolucion longitudinal por NUSHA.
3. **Cuadro de mando**: indicadores agregados, filtros y listado.
4. **Cargar/actualizar base**: seleccion manual de `Base_Datos_HS_Valme.xlsx`.

Todo funciona en el navegador sin backend, sin bases de datos ni llamadas a red para las funciones principales.

## Como ejecutar y validar

### Entorno de desarrollo

```powershell
cd HCE/hs_valme_hub
npm install
npm run dev
```

Abre la URL que muestre Vite (por defecto `http://localhost:5173/`).

### Build para despliegue estatico

```powershell
cd HCE/hs_valme_hub
npm run build
```

El resultado se escribe en `HCE/hs_valme_hub/dist/`. Para probarlo localmente:

```powershell
python start_server.py
```

Y abrir `http://127.0.0.1:8003/HCE/hs_valme_hub/dist/index.html`.

### Comprobaciones automaticas (Node)

```powershell
cd HCE/hs_valme_hub
node tests/tsv-export-check-node.mjs
node tests/dashboard-check-node.mjs
node tests/stale-base-check-node.mjs
node tests/parity-check-node.mjs
node tests/scope-guard-check-node.mjs
```

Todas deben terminar con `PASS`.

### Validacion manual recomendada

1. Cargar `Base_Datos_HS_Valme.xlsx` y confirmar que aparecen los conteos de `Monografica` y `Multidisciplinar`.
2. Abrir `Registrar visita` > `Primera visita`, completar datos y copiar la fila TSV.
3. Pegar la fila en la hoja correspondiente de Excel, guardar y recargar la base en el hub.
4. Abrir `Ver paciente`, seleccionar el NUSHA y revisar las secciones:
   - Evolucion IHS-4
   - Tratamientos
   - Peso
   - PROMs (incluye EVA dolor, prurito, olor y supuracion)
   - Brotes
   - Ecografia (incluye hallazgos textuales)
   - Habitos toxicos
   - Cirugia
   - Comorbilidades
5. Abrir `Cuadro de mando` y comprobar KPIs y filtros.
6. Con DevTools abiertas, deshabilitar la red y recargar: parseo, graficos e iconos deben seguir funcionando.
7. Verificar que `localStorage`, `sessionStorage` e `IndexedDB` estan vacios tras la sesion.

## Carga de Excel y portapapeles

- El hub acepta `.xlsx`, `.xls` y `.csv`.
- Solo lee las hojas `Monografica` y `Multidisciplinar`.
- La primera fila de cada hoja debe contener los nombres de columna.
- Si falta una hoja o el archivo esta corrupto, el hub limpia la memoria y muestra un error.
- La escritura principal es al **portapapeles** (fila TSV de una sola fila).
- Las descargas CSV/TSV del cuadro de mando son **secundarias** y estan etiquetadas como tal.

## Paridad con los formularios legacy

Se ha anadido `tests/parity-check-node.mjs` que compara fila a fila el TSV del hub con el TSV que generaria el formulario legacy `hs_valme_formulario_clinico.html` para:

- Primera visita monografica.
- Primera visita multidisciplinar.
- Seguimiento monografico.

El esquema actual es `HEADERS_HS_VERSION = 'v2'`. La prueba verifica que el **prefijo v1 (columnas no modificadas) sigue siendo identico byte a byte**. Las columnas v2 son nuevas y no se espera que el formulario legacy las genere; el test las documenta como divergencia esperada. La prueba se ejecuta con:

```powershell
node tests/parity-check-node.mjs
```

### Diferencias resueltas

- Normalizacion de respuestas Si/No: el hub exporta `Si`/`No` (capitalizado) para `antecedentes_familiares_hs` y `fumador`, igual que el formulario legacy.
- El campo `eco_doppler` se elimina del esquema v2; las filas historicas que lo contengan siguen siendo legibles.

### Limitaciones conocidas

- El hub sanitiza saltos de linea en las celdas TSV convirtiendolos en espacios; el formulario legacy los conserva. Esto solo afecta a campos de texto libre con saltos de linea y evita filas TSV rotas.
- Las respuestas de Morisky-Green se exportan en minusculas (`si`/`no`) tanto en el hub como en el legacy; el resultado derivado (`adherente` / `no_adherente`) es el mismo.

## Transicion de archivos legacy

Los archivos legacy se han renombrado a:

- `HCE/hs_valme_formulario_clinico.legacy.html`
- `HCE/hs_valme_cuadro_mando_clinico.legacy.html`

Ambos incluyen una cabecera visible que redirige al nuevo hub (`HCE/hs_valme_hub/index.html`).

### Plan a futuro

Tras un ciclo de uso confirmado sin incidencias, los archivos `.legacy.html` se moveran a `HCE/_legacy/` para mantener la raiz de `HCE/` limpia, permaneciendo accesibles desde este documento por si fuera necesario un rollback.

## Ambito excluido

Para evitar confusiones, estos elementos **no forman parte de este cambio**:

- `HCE/HS_consulta_enfermeria_HVR_2.html` (referencia, sin integracion).
- `HCE/PsO/` (referencia, sin integracion).
- Modulos de enfermeria o PsO.
- Backend, base de datos real o sincronizacion automatica.
- Persistencia de borradores en el navegador.
- Dependencia de CDN en tiempo de ejecucion.

## Fallback offline y en red hospitalaria

Si GitHub Pages o la red del hospital bloquean el host:

1. Ejecutar `npm run build`.
2. Copiar la carpeta `HCE/hs_valme_hub/dist/` a un recurso local.
3. Abrir `index.html` directamente desde ese recurso.

Todas las dependencias criticas (SheetJS, Chart.js, iconos Lucide) estan incluidas en `vendor/`.

## Contacto y proximos pasos

- Mantenedor del cambio: equipo de mejora asistencial HS Valme.
- Proximos pasos tras estabilizacion: mover `.legacy.html` a `HCE/_legacy/` y actualizar `Guia_Operativa_HS_Valme.docx` para que apunte al hub.
