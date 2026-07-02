# Hub Clínico HS Valme

Aplicación web estática para registrar visitas de Hidradenitis Supurativa, consultar el seguimiento longitudinal de pacientes y revisar indicadores agregados del servicio.

El hub está pensado para publicarse en GitHub Pages o ejecutarse localmente sin backend. Los datos no viven en la aplicación: el usuario carga manualmente el Excel sintético/hospitalario desde su ordenador o carpeta compartida.

## Cómo abrir el hub

No abras `index.html` con doble click. La app usa módulos JavaScript y debe servirse por HTTP.

```powershell
cd "HCE\hs_valme_hub"
npm install
npm run dev
```

Después abre la URL que muestre Vite, normalmente:

```text
http://localhost:5173/
```

## Probar la versión publicable

```powershell
cd "HCE\hs_valme_hub"
npm run build
npm run preview
```

La versión generada queda en `HCE/hs_valme_hub/dist/`.

## Verificación

```powershell
cd "HCE\hs_valme_hub"
node tests/dashboard-check-node.mjs
node tests/tsv-export-check-node.mjs
node tests/stale-base-check-node.mjs
node tests/parity-check-node.mjs
node tests/scope-guard-check-node.mjs
```

## Alcance

Incluido:

- Registrar visita HS: primera visita y seguimiento.
- Ver paciente: cuadro de mando individual/longitudinal.
- Cuadro de mando: indicadores poblacionales y de servicio.
- Carga manual del Excel una sola vez por sesión.
- Exportación TSV para copiar/pegar en el Excel acumulativo.

Fuera de alcance:

- Enfermería.
- PsO en esta primera versión.
- Backend o base de datos real.
- Guardado local de borradores clínicos.
- Datos reales de pacientes en el repositorio.

## Documentación útil

- `docs/CONTRATO_DATOS_HS.md` — contrato de datos y esquema HS.
- `docs/ESTADO_IMPLEMENTACION_HS.md` — estado, uso y validación de la implementación.
- `openspec/specs/` — especificaciones SDD archivadas como fuente de verdad funcional.

## Publicación en GitHub Pages

La app final es estática. Para publicarla, configurar GitHub Pages para servir la carpeta generada por el build o adaptar el workflow de despliegue que se decida para el repositorio.

Antes de publicar, revisar que no se añaden al repo Excel reales, documentos clínicos sensibles ni outputs generados no necesarios.
