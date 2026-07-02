# Contrato de Datos HS Valme

## 1. Proposito

Este documento define el contrato de datos del **Hub Clinico HS Valme**, la herramienta unificada para el registro y seguimiento de pacientes con **Hidradenitis Supurativa (HS)** del Hospital Universitario de Valme.

Su objetivo es que clinicos, desarrolladores y mantenedores compartan la misma definicion de:

- Hojas y columnas del libro Excel canonico.
- Flujo de carga, uso y escritura de datos.
- Clave de paciente, calculos derivados y reglas de validacion.
- Limites de privacidad y persistencia.

## 2. Libro canonico

El libro maestro sigue siendo el archivo `Base_Datos_HS_Valme.xlsx` gestionado por el hospital. El hub no lo modifica; unicamente lo lee en memoria y genera filas para copiar y pegar en el.

### 2.1 Hojas obligatorias

| Hoja (clave) | Nombre exacto en Excel | Contenido |
|---|---|---|
| `monografica` | `Monografica` | Visitas del circuito monografico de Dermatologia. |
| `multidisciplinar` | `Multidisciplinar` | Visitas del circuito multidisciplinar (Dermatologia + Cirugia). |

El hub informa explicitamente si falta alguna de estas hojas y descarta cualquier dato anterior para evitar datos obsoletos.

### 2.2 Version de cabeceras

- `HEADERS_HS_VERSION = 'v2'`.
- La version v2 es **append-only**: se anaden nuevas columnas monograficas al final del bloque v1 (despues de `hallazgos_interes`) y antes de cualquier futuro bloque `seguimiento_*`. El prefijo v1 se mantiene byte-identico salvo por la eliminacion de `eco_doppler`.
- Cualquier cambio en el orden o nombre de columnas requiere actualizar `src/schema/hs_schema.js`, repetir la prueba de paridad y, si procede, incrementar la version.

## 3. Clave de paciente

- **NUSHA** es el identificador canonico del paciente en ambas hojas.
- Formato valido: dos letras seguidas de diez digitos (ejemplo: `AN1234567890`).
- No se admiten espacios ni separadores.

## 4. Flujo de datos

```
[Base_Datos_HS_Valme.xlsx] --(carga manual)--> [excel/loader.js] --(memoria)--> [store.js]
                                                                     |
       +----------------+----------------+----------------+----------------+
       |                |                |                |
  [form/*.js]   [patient/*.js]  [service/*.js]    [ui shell]
       |                |                |
   [tsv/*.js]      [chart/*.js]     [chart/*.js]
       |
[portapapeles] --(pegar)--> [Base_Datos_HS_Valme.xlsx]
```

1. El usuario selecciona el libro Excel desde el ordenador del hospital.
2. El hub lo parsea con SheetJS (vendored) y guarda las filas **unicamente en memoria**.
3. Los modulos de registro, paciente y cuadro de mando leen el mismo conjunto en memoria.
4. Al completar una visita, el hub genera una fila TSV y la copia al portapapeles.
5. El usuario pega la fila en la hoja correspondiente de Excel.
6. Al recargar el libro, el ciclo vuelve a empezar.

## 5. Privacidad y persistencia

| Aspecto | Regla |
|---|---|
| Datos de pacientes en el repositorio | **Prohibido**. Ni el repo ni `dist/` contienen datos reales. |
| Datos de pacientes en el despliegue | **Prohibido**. GitHub Pages solo sirve el codigo estatico. |
| Persistencia en navegador | **Prohibida**. No se usa `localStorage`, `sessionStorage`, `IndexedDB`, cookies ni WebSQL. |
| Datos en memoria | Permitiida unicamente durante la sesion activa. Al recargar o cerrar la pestana desaparecen. |
| Escritura | El portapapeles es el camino principal. Las descargas secundarias estan etiquetadas como "secundario". |
| Red | No hay telemetria, analitica ni llamadas a CDN en tiempo de ejecucion. |

## 6. Semantica de circuitos y visitas

### 6.1 Circuitos

- **Monografica**: primera linea especializada y seguimiento dermatologico.
- **Multidisciplinar**: alta resolucion Derma-Cirugia para casos complejos o candidatos a cirugia.

La hoja de destino (`hoja_destino`) se deriva del campo `consulta`:

| `consulta` | `hoja_destino` |
|---|---|
| `monografica` | `Monografica` |
| `multidisciplinar` | `Multidisciplinar` |

### 6.2 Tipos de visita

| `tipo_visita` | Uso |
|---|---|
| `primera` | Primera visita del paciente en el circuito. Activa bloque de cirugia y farmacoterapia inicial. |
| `seguimiento` | Visita de control. Activa decision terapeutica: continuar o cambiar tratamiento. |

## 7. Calculos derivados

### 7.1 IHS-4 clinico y ecografico

```
IHS-4 = nodulos * 1 + abscesos * 2 + (fistulas + fistulas_drenantes) * 4
```

En la formula v2 `f` y `fd` tienen el mismo peso (4). Las historias con `fd > 0` pueden mostrar un IHS-4 superior al calculado con la formula legacy; esto es la correccion de integridad documentada.

Gravedad:

| Rango | Gravedad |
|---|---|
| < 4 | Leve |
| 4 - 10 | Moderado |
| > 10 | Grave |

### 7.2 IMC

```
IMC = peso_kg / (talla_m * talla_m)
```

Resultado redondeado a dos decimales.

### 7.3 PROMs

- **DLQI**: suma de 10 items (0-3). Interpretacion: Sin impacto, Impacto leve, Impacto moderado, Impacto alto, Impacto muy alto.
- **HSQoL-24**: suma de 24 items (0-4), con algunos items invertidos. Interpretacion: Impacto bajo, Impacto leve, Impacto moderado, Impacto alto.
- **EVA dolor**, **EVA prurito**, **EVA olor**, **EVA supuracion**: escalas 0-10.

### 7.4 Campos monograficos v2

Columnas anadidas en `HEADERS_HS_VERSION = 'v2'` (append-only despues de `hallazgos_interes`):

| Grupo | Campos |
|---|---|
| Comorbilidad | `comorb_acne_conglobata` |
| Region IHS | `ihs_cuero_cabelludo_n`, `ihs_cuero_cabelludo_a`, `ihs_cuero_cabelludo_f`, `ihs_cuero_cabelludo_fd` |
| Demografia | `edad_inicio`, `nivel_educativo` |
| Habitos toxicos | `fumador_estado`, `exfumador_anios`, `alcohol_consume`, `alcohol_cervezas_vino_semana`, `alcohol_copas_destilados_semana`, `alcohol_ube_semana` |
| Brotes | `flares_total_ultimo_anio` (primera visita), `flares_desde_ultima_visita` (seguimiento), `flares_requirio_urgencias`, `flares_requirio_cirugia`, `flares_requirio_antibioticos` |
| PROMs | `eva_prurito`, `eva_olor`, `eva_supuracion` |
| Ecografia | `eco_hallazgos` (texto libre); se elimina `eco_doppler` |

Reglas derivadas:

- `fumador` legacy se calcula como `Si` cuando `fumador_estado === 'Fumador'`, de lo contrario `No`.
- `alcohol_ube_semana` = `alcohol_cervezas_vino_semana + 2 * alcohol_copas_destilados_semana`.
- El campo `eco_doppler` se elimina del esquema v2; las filas historicas que lo contengan siguen siendo legibles pero no se emiten en nuevas filas.

## 8. Farmacoterapia

Las terapias se organizan por familias:

| Familia | Farmacos predefinidos |
|---|---|
| `topicos` | Clindamicina topica, Resorcinol |
| `antibioticos_orales` | Doxiciclina, Clindamicina oral, Rifampicina |
| `biologicos` | Adalimumab, Secukinumab, Bimekizumab |

Cada familia admite hasta 3 lineas principales (`farmaco_N` / `posologia_N`) mas un campo `otros` para lineas adicionales separadas por ` || ` y `|`.

Prefijos:

| Prefijo | Uso |
|---|---|
| `tx_primera` | Tratamiento activo en primera visita. |
| `tx_seguimiento` | Tratamiento en seguimiento, ya sea continuado o nuevo. |

## 9. Cirugia

El bloque de cirugia aplica principalmente a primeras visitas monograficas. Campos:

| Campo checkbox | Campo notas |
|---|---|
| `cirugia_dermatologia` | `consideraciones_dermatologia` |
| `cirugia_general` | `consideraciones_general` |
| `cirugia_plastica` | `consideraciones_plastica` |
| `cirugia_ginecologia` | `consideraciones_ginecologia` |
| `cirugia_urologia` | `consideraciones_urologia` |

`cirugia_aplica` vale `Si` si al menos uno de los checkboxes esta activo.

## 10. Validacion

Campos obligatorios por circuito:

- `nusha`
- `fecha_visita`
- `tipo_visita`
- `consulta`
- `origen_paciente`

Reglas adicionales:

- `nusha`: `^[A-Z]{2}\d{10}$`.
- `fecha_visita`: `AAAA-MM-DD`.
- `anio_inicio`, `anio_diagnostico`: 1900-2100.
- `peso_kg`, `talla_m`: mayor o igual a 0.
- `eva_dolor`, `eva_prurito`, `eva_olor`, `eva_supuracion`: enteros 0-10.
- `flares_total_ultimo_anio`, `flares_desde_ultima_visita`: enteros mayores o iguales a 0.
- `alcohol_cervezas_vino_semana`, `alcohol_copas_destilados_semana`, `alcohol_ube_semana`: mayores o iguales a 0.

La exportacion se bloquea si falla alguna validacion y no se modifica el portapapeles.

## 11. Ambito excluido

El siguiente material existe en el repositorio como **referencia unicamente** y no forma parte del hub HS:

- `HCE/HS_consulta_enfermeria_HVR_2.html` (consulta de enfermeria).
- `HCE/PsO/` (herramientas de Psoriasis).
- `Plantillas Historia Clinica HUV Rocio/` (plantillas de referencia).
- Repositorios externos (HS-Canarias, Badajoz): inspiracion inicial, no codigo fuente de verdad.

No se integran modulos de enfermeria ni de PsO, ni se anaden rutas, nav items ni migraciones para ellos.

## 12. Cambios de version

Para cambiar el esquema:

1. Actualizar `src/schema/hs_schema.js` y `HEADERS_HS_VERSION`.
2. Actualizar este contrato.
3. Ejecutar `node tests/parity-check-node.mjs` y resolver diferencias.
4. Actualizar `docs/ESTADO_IMPLEMENTACION_HS.md`.
5. Comunicar a los clinicos el cambio antes de publicar.
