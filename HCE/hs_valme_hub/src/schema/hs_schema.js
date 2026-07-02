/**
 * HS Valme shared schema — single source of truth for forms, TSV export,
 * Excel loading, and dashboards.
 *
 * HEADERS_HS_VERSION must remain in sync with the canonical workbook schema.
 */

export const HEADERS_HS_VERSION = 'v2';

export const SHEET_KEYS = {
  monografica: 'Monografica',
  multidisciplinar: 'Multidisciplinar'
};

export const CANONICAL_PATIENT_KEY = 'nusha';

export const IHS_REGIONS = [
  { key: 'axila_d', label: 'Axilas(D)' },
  { key: 'axila_i', label: 'Axilas(I)' },
  { key: 'ingle_d', label: 'Ingles(D)' },
  { key: 'ingle_i', label: 'Ingles(I)' },
  { key: 'gluteo_d', label: 'Gluteo(D)' },
  { key: 'gluteo_i', label: 'Gluteo(I)' },
  { key: 'muslo_d', label: 'Muslos(D)' },
  { key: 'muslo_i', label: 'Muslos(I)' },
  { key: 'mama_d', label: 'Mamas(D)' },
  { key: 'mama_i', label: 'Mamas(I)' },
  { key: 'intermamaria', label: 'Intermamaria' },
  { key: 'genital', label: 'Genital' },
  { key: 'perianal', label: 'Perianal' },
  { key: 'otras', label: 'Otras' },
  { key: 'cuero_cabelludo', label: 'Cuero cabelludo', schemaVersion: 'v2' }
];

const V1_IHS_REGIONS = IHS_REGIONS.filter(region => region.schemaVersion !== 'v2');
const V2_IHS_REGIONS = IHS_REGIONS.filter(region => region.schemaVersion === 'v2');

export const IHS_LESION_TYPES = [
  { key: 'n', shortLabel: 'N', className: 'nodulo' },
  { key: 'a', shortLabel: 'A', className: 'absceso' },
  { key: 'f', shortLabel: 'F', className: 'fistula' },
  { key: 'fd', shortLabel: 'FD', className: 'fistula-drenante' }
];

export const SURGERY_FIELDS = [
  { checkbox: 'cirugia_dermatologia', note: 'consideraciones_dermatologia', label: 'Dermatologia' },
  { checkbox: 'cirugia_general', note: 'consideraciones_general', label: 'Cirugia General' },
  { checkbox: 'cirugia_plastica', note: 'consideraciones_plastica', label: 'Cirugia Plastica' },
  { checkbox: 'cirugia_ginecologia', note: 'consideraciones_ginecologia', label: 'Ginecologia' },
  { checkbox: 'cirugia_urologia', note: 'consideraciones_urologia', label: 'Urologia' }
];

export const DLQI_OPTION_SETS = {
  standard: [
    { label: 'Nada', value: 0 },
    { label: 'Un poco', value: 1 },
    { label: 'Bastante', value: 2 },
    { label: 'Mucho', value: 3 }
  ],
  with_no_relation: [
    { label: 'Sin relacion', value: 0 },
    { label: 'Un poco', value: 1 },
    { label: 'Bastante', value: 2 },
    { label: 'Mucho', value: 3 }
  ]
};

export const DLQI_ITEMS = [
  { text: '1. Durante los ultimos 7 dias, ha sentido picor, dolor o escozor en la piel?', optionSet: 'standard' },
  { text: '2. Durante los ultimos 7 dias, se ha sentido incomodo/a o cohibido/a debido a sus problemas de piel?', optionSet: 'standard' },
  { text: '3. Durante los ultimos 7 dias, le han molestado sus problemas de piel para hacer la compra u ocuparse de la casa (o del jardin)?', optionSet: 'with_no_relation' },
  { text: '4. Durante los ultimos 7 dias, han influido sus problemas de piel en la eleccion de la ropa que lleva?', optionSet: 'with_no_relation' },
  { text: '5. Durante los ultimos 7 dias, han influido sus problemas de piel en cualquier actividad social o recreativa?', optionSet: 'with_no_relation' },
  { text: '6. Durante los ultimos 7 dias, ha tenido dificultades para hacer deporte debido a sus problemas de piel?', optionSet: 'with_no_relation' },
  { text: '7. Durante los ultimos 7 dias, sus problemas de piel le han impedido totalmente trabajar o estudiar?', optionSet: 'standard' },
  { text: '8. Durante los ultimos 7 dias, han causado sus problemas de piel dificultades con su pareja o sus amigos y familiares?', optionSet: 'with_no_relation' },
  { text: '9. Durante los ultimos 7 dias, han causado sus problemas de piel dificultades sexuales?', optionSet: 'with_no_relation' },
  { text: '10. Durante los ultimos 7 dias, le ha causado problemas el tratamiento de la piel, por ejemplo ensuciandole la casa o quitandole tiempo?', optionSet: 'with_no_relation' }
];

export const HSQOL_OPTIONS = [
  { label: 'Nunca', value: 0 },
  { label: 'Raramente', value: 1 },
  { label: 'A veces', value: 2 },
  { label: 'A menudo', value: 3 },
  { label: 'Siempre', value: 4 }
];

export const HSQOL_ITEMS = [
  { text: '1. La HS afecta a mi estado de animo.', reverse: false },
  { text: '2. La HS empeora con el estres.', reverse: false },
  { text: '3. Me he resignado a convivir con la HS.', reverse: false },
  { text: '4. Me preocupa la poca eficacia del tratamiento.', reverse: false },
  { text: '5. Me siento solo o aislado por la HS.', reverse: false },
  { text: '6. Tener informacion sobre la HS me ayuda a aceptarla.', reverse: true },
  { text: '7. La HS me ha llevado a pensar en hacerme dano o suicidarme.', reverse: false },
  { text: '8. Me preocupa que alguno de mis hijos pueda tener HS.', reverse: false },
  { text: '9. Me preocupa el mal olor causado por la HS.', reverse: false },
  { text: '10. Evito hablar de mi HS.', reverse: false },
  { text: '11. Me preocupa ser rechazado por mi HS.', reverse: false },
  { text: '12. Me siento avergonzado por mi HS.', reverse: false },
  { text: '13. Me preocupa el coste del tratamiento.', reverse: false },
  { text: '14. La HS me dificulta realizar mi trabajo.', reverse: false },
  { text: '15. Me preocupa perder mi empleo por la HS.', reverse: false },
  { text: '16. La HS afecta a mis relaciones personales.', reverse: false },
  { text: '17. Mi familia es mi principal apoyo frente a la HS.', reverse: true },
  { text: '18. Me preocupa tener que renunciar a ciertas actividades por la HS.', reverse: false },
  { text: '19. La HS supone un problema en mis relaciones intimas.', reverse: false },
  { text: '20. El agua empeora mis lesiones.', reverse: false },
  { text: '21. La HS afecta a mi sueno.', reverse: false },
  { text: '22. Valoro positivamente las iniciativas para mejorar mi HS.', reverse: true },
  { text: '23. A veces me resulta dificil seguir tratamientos y revisiones.', reverse: false },
  { text: '24. Me preocupan los efectos adversos de los tratamientos.', reverse: false }
];

export const THERAPY_GROUPS = [
  { key: 'topicos', label: 'Topicos', options: ['Clindamicina topica', 'Resorcinol'] },
  { key: 'antibioticos_orales', label: 'Antibioticos orales', options: ['Doxiciclina', 'Clindamicina oral', 'Rifampicina'] },
  { key: 'biologicos', label: 'Biologicos', options: ['Adalimumab', 'Secukinumab', 'Bimekizumab'] }
];

export const THERAPY_SLOT_LIMIT = 3;

export const COMORBIDITY_FIELDS = [
  { key: 'comorb_diabetes_tipo_ii', label: 'Diabetes tipo II' },
  { key: 'comorb_hta', label: 'HTA' },
  { key: 'comorb_dislipemia', label: 'Dislipemia' },
  { key: 'comorb_enf_cardiovascular', label: 'Enf. Cardiovascular' },
  { key: 'comorb_sindrome_metabolico', label: 'Sindrome metabolico' },
  { key: 'comorb_esteatosis_hepatica', label: 'Esteatosis hepatica' },
  { key: 'comorb_sinus_pilonidal', label: 'Sinus pilonidal' },
  { key: 'comorb_colitis_ulcerosa', label: 'Colitis ulcerosa' },
  { key: 'comorb_crohn', label: 'Enf. de Crohn' },
  { key: 'comorb_artritis', label: 'Artritis' },
  { key: 'comorb_psoriasis', label: 'Psoriasis' },
  { key: 'comorb_sop', label: 'SOP' },
  { key: 'comorb_acne', label: 'Acne' },
  { key: 'comorb_depresion', label: 'Depresion' },
  { key: 'comorb_ansiedad', label: 'Ansiedad' },
  { key: 'comorb_pash_papash', label: 'PASH/PAPASH' },
  { key: 'comorb_pioderma_gangrenoso', label: 'Pioderma gangrenoso' },
  { key: 'comorb_foliculitis_decalvante', label: 'Foliculitis decalvante' },
  { key: 'comorb_acne_conglobata', label: 'Acne conglobata', schemaVersion: 'v2' }
];

const V1_COMORBIDITY_FIELDS = COMORBIDITY_FIELDS.filter(field => field.schemaVersion !== 'v2');
const V2_COMORBIDITY_FIELDS = COMORBIDITY_FIELDS.filter(field => field.schemaVersion === 'v2');

export function buildTherapyFieldNames(prefix) {
  const fields = [];
  for (const group of THERAPY_GROUPS) {
    for (let i = 1; i <= THERAPY_SLOT_LIMIT; i += 1) {
      fields.push(`${prefix}_${group.key}_farmaco_${i}`);
      fields.push(`${prefix}_${group.key}_posologia_${i}`);
    }
    fields.push(`${prefix}_${group.key}_otros`);
  }
  return fields;
}

export function buildHeadersHS() {
  const headers = [
    'nusha',
    'fecha_visita',
    'tipo_visita',
    'consulta',
    'hoja_destino',
    'cie',
    'origen_paciente',
    'solicitud_analitica',
    'solicitud_medicina_preventiva',
    'antecedentes_familiares_hs',
    'anio_inicio',
    'fumador',
    'cigarros_dia',
    'anios_fumador',
    'sexo_nacimiento',
    'anio_diagnostico',
    'peso_kg',
    'talla_m',
    'imc'
  ];

  headers.push(...V1_COMORBIDITY_FIELDS.map(f => f.key));
  headers.push('otras_comorbilidades');

  for (const region of V1_IHS_REGIONS) {
    headers.push(`ihs_${region.key}_n`);
    headers.push(`ihs_${region.key}_a`);
    headers.push(`ihs_${region.key}_f`);
    headers.push(`ihs_${region.key}_fd`);
  }

  headers.push(
    'otras_regiones',
    'cicatrices',
    'otras_lesiones',
    'ihs_total_n',
    'ihs_total_a',
    'ihs_total_f',
    'ihs_total_fd',
    'ihs4_total',
    'ihs4_gravedad',
    'eco_nodulos',
    'eco_abscesos',
    'eco_fistulas',
    'eco_ihs4',
    'eco_gravedad'
  );

  for (let i = 1; i <= DLQI_ITEMS.length; i += 1) headers.push(`dlqi_q${i}`);
  headers.push('dlqi_total', 'dlqi_interpretacion');
  for (let i = 1; i <= HSQOL_ITEMS.length; i += 1) headers.push(`hsqol_q${i}`);
  headers.push('hsqol_total', 'hsqol_interpretacion', 'eva_dolor');

  headers.push('cirugia_aplica');
  for (const field of SURGERY_FIELDS) {
    headers.push(field.checkbox);
    headers.push(field.note);
  }

  headers.push(...buildTherapyFieldNames('tx_primera'));
  headers.push(...buildTherapyFieldNames('tx_seguimiento'));

  headers.push(
    'seguimiento_tratamiento_previo',
    'seguimiento_tratamiento_actual',
    'seguimiento_decision',
    'seguimiento_adherencia',
    'seguimiento_ajuste_pauta',
    'seguimiento_morisky_q1',
    'seguimiento_morisky_q2',
    'seguimiento_morisky_q3',
    'seguimiento_morisky_q4',
    'seguimiento_morisky_resultado',
    'seguimiento_motivo_cambio',
    'seguimiento_efectos_adversos',
    'otros_comentarios',
    'hallazgos_interes',
    ...V2_COMORBIDITY_FIELDS.map(f => f.key),
    ...V2_IHS_REGIONS.flatMap(region => [
      `ihs_${region.key}_n`,
      `ihs_${region.key}_a`,
      `ihs_${region.key}_f`,
      `ihs_${region.key}_fd`
    ]),
    'edad_inicio',
    'nivel_educativo',
    'fumador_estado',
    'exfumador_anios',
    'alcohol_consume',
    'alcohol_cervezas_vino_semana',
    'alcohol_copas_destilados_semana',
    'alcohol_ube_semana',
    'flares_total_ultimo_anio',
    'flares_desde_ultima_visita',
    'flares_requirio_urgencias',
    'flares_requirio_cirugia',
    'flares_requirio_antibioticos',
    'eva_prurito',
    'eva_olor',
    'eva_supuracion',
    'eco_hallazgos'
  );

  return headers;
}

export const COLUMNS = {
  monografica: buildHeadersHS(),
  multidisciplinar: buildHeadersHS()
};

export const REQUIRED = {
  monografica: ['nusha', 'fecha_visita', 'tipo_visita', 'consulta', 'origen_paciente'],
  multidisciplinar: ['nusha', 'fecha_visita', 'tipo_visita', 'consulta', 'origen_paciente']
};

export const VALIDATORS = {
  nusha: {
    pattern: /^[A-Z]{2}\d{10}$/,
    message: 'NUSHA debe tener 2 letras seguidas de 10 numeros (ej. AN1234567890).'
  },
  fecha_visita: {
    pattern: /^\d{4}-\d{2}-\d{2}$/,
    message: 'La fecha debe tener formato AAAA-MM-DD.'
  },
  anio_inicio: { min: 1900, max: 2100, message: 'Anio inicio fuera de rango.' },
  anio_diagnostico: { min: 1900, max: 2100, message: 'Anio diagnostico fuera de rango.' },
  peso_kg: { min: 0, message: 'Peso debe ser mayor o igual a 0.' },
  talla_m: { min: 0, message: 'Talla debe ser mayor o igual a 0.' }
};

export const DERIVED = {
  ihs4Score({ n = 0, a = 0, f = 0, fd = 0 }) {
    return n + a * 2 + (f + fd) * 4;
  },
  ihs4Grade(score) {
    if (score < 4) return 'Leve';
    if (score <= 10) return 'Moderado';
    return 'Grave';
  },
  imc({ pesoKg, tallaM }) {
    if (!pesoKg || !tallaM) return '';
    return (pesoKg / (tallaM * tallaM)).toFixed(2);
  }
};

export const DASHBOARD_MAP = {
  evolution: {
    label: 'Evolucion IHS-4',
    columns: ['fecha_visita', 'ihs4_total', 'ihs4_gravedad', 'eco_ihs4', 'eco_gravedad']
  },
  treatments: {
    label: 'Tratamientos',
    columns: [
      'fecha_visita',
      ...buildTherapyFieldNames('tx_primera'),
      ...buildTherapyFieldNames('tx_seguimiento'),
      'seguimiento_tratamiento_previo',
      'seguimiento_tratamiento_actual',
      'seguimiento_decision',
      'seguimiento_ajuste_pauta'
    ]
  },
  weight: {
    label: 'Peso',
    columns: ['fecha_visita', 'peso_kg', 'talla_m', 'imc']
  },
  proms: {
    label: 'PROMs',
    columns: ['fecha_visita', 'dlqi_total', 'dlqi_interpretacion', 'hsqol_total', 'hsqol_interpretacion', 'eva_dolor', 'eva_prurito', 'eva_olor', 'eva_supuracion']
  },
  flares: {
    label: 'Brotes',
    columns: ['fecha_visita', 'flares_total_ultimo_anio', 'flares_desde_ultima_visita', 'flares_requirio_urgencias', 'flares_requirio_cirugia', 'flares_requirio_antibioticos']
  },
  ultrasound: {
    label: 'Ecografia',
    columns: ['fecha_visita', 'eco_nodulos', 'eco_abscesos', 'eco_fistulas', 'eco_ihs4', 'eco_gravedad', 'eco_hallazgos']
  },
  toxicHabits: {
    label: 'Habitos toxicos',
    columns: ['fecha_visita', 'fumador_estado', 'exfumador_anios', 'alcohol_consume', 'alcohol_cervezas_vino_semana', 'alcohol_copas_destilados_semana', 'alcohol_ube_semana']
  },
  surgery: {
    label: 'Cirugia',
    columns: ['fecha_visita', 'cirugia_aplica', ...SURGERY_FIELDS.flatMap(f => [f.checkbox, f.note])]
  },
  comorbidities: {
    label: 'Comorbilidades',
    columns: ['fecha_visita', ...COMORBIDITY_FIELDS.map(f => f.key), 'otras_comorbilidades']
  }
};

export const ORIGEN_PACIENTE_OPTIONS = [
  'derma_gral',
  'atencion_primaria',
  'infecciosas',
  'urgencias',
  'cirugia_general',
  'cirugia_plastica',
  'ginecologia',
  'urologia',
  'monografica',
  'multidisciplinar'
];

export const TIPO_VISITA_OPTIONS = [
  { value: 'primera', label: 'Primera visita' },
  { value: 'seguimiento', label: 'Seguimiento' }
];
