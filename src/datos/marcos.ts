import type { Criterio, MarcoId } from '../tipos/dominio';

export const CRITERIOS: readonly Criterio[] = [
  // ---- EU AI Act (risk-based obligations) ----
  {
    id: 'euaia-risk-classification',
    marco: 'euaia',
    categoria: 'Risk classification',
    titulo: 'Risk classification',
    descripcion:
      'The system is classified into the correct risk category (prohibited, high, limited, minimal) under the EU AI Act, with documented justification.',
  },
  {
    id: 'euaia-transparency',
    marco: 'euaia',
    categoria: 'High-risk obligations',
    titulo: 'Transparency and information',
    descripcion:
      'Users are clearly informed they are interacting with an AI system and receive understandable information about its capabilities and limitations.',
  },
  {
    id: 'euaia-data-governance',
    marco: 'euaia',
    categoria: 'High-risk obligations',
    titulo: 'Data and data governance',
    descripcion:
      'Training, validation and testing datasets are relevant, representative, free of errors and as complete as possible, with documented governance.',
  },
  {
    id: 'euaia-human-oversight',
    marco: 'euaia',
    categoria: 'High-risk obligations',
    titulo: 'Human oversight',
    descripcion:
      'The system is designed so natural persons can oversee it, intervene, and override or stop it, proportionate to the risk.',
  },
  {
    id: 'euaia-accuracy-robustness',
    marco: 'euaia',
    categoria: 'High-risk obligations',
    titulo: 'Accuracy, robustness and cybersecurity',
    descripcion:
      'The system achieves appropriate accuracy and robustness, and is resilient against errors, faults and attacks (Article 15).',
  },
  {
    id: 'euaia-logging',
    marco: 'euaia',
    categoria: 'High-risk obligations',
    titulo: 'Record-keeping (logs)',
    descripcion:
      'The system automatically logs events for traceability and post-market monitoring (Article 12).',
  },
  {
    id: 'euaia-technical-documentation',
    marco: 'euaia',
    categoria: 'High-risk obligations',
    titulo: 'Technical documentation',
    descripcion:
      'Technical documentation demonstrating compliance is drawn up and kept up to date (Article 11).',
  },
  {
    id: 'euaia-fundamental-rights',
    marco: 'euaia',
    categoria: 'High-risk obligations',
    titulo: 'Fundamental rights impact assessment',
    descripcion:
      'A fundamental rights impact assessment was performed before deployment where required (Article 27).',
  },

  // ---- NIST AI RMF (Govern / Map / Measure / Manage) ----
  {
    id: 'nist-govern',
    marco: 'nist',
    categoria: 'GOVERN',
    titulo: 'AI risk governance',
    descripcion:
      'Policies, processes and accountability structures exist for AI risk management across the lifecycle, with clear roles and ownership.',
  },
  {
    id: 'nist-map-context',
    marco: 'nist',
    categoria: 'MAP',
    titulo: 'Context and use-case mapping',
    descripcion:
      'The intended purpose, users, deployment context and potential impacts of the system are documented and understood.',
  },
  {
    id: 'nist-map-risk-categorization',
    marco: 'nist',
    categoria: 'MAP',
    titulo: 'Risk categorization',
    descripcion:
      'Risks are identified and categorized (e.g. safety, security, privacy, bias) with likelihood and severity assessments.',
  },
  {
    id: 'nist-measure-accuracy',
    marco: 'nist',
    categoria: 'MEASURE',
    titulo: 'Measurement of accuracy and robustness',
    descripcion:
      'Performance is quantitatively measured (accuracy, robustness, reliability) against defined metrics and thresholds.',
  },
  {
    id: 'nist-measure-bias',
    marco: 'nist',
    categoria: 'MEASURE',
    titulo: 'Fairness and bias measurement',
    descripcion:
      'Fairness and harmful bias are measured across relevant groups, with documented methods and results.',
  },
  {
    id: 'nist-manage-incident',
    marco: 'nist',
    categoria: 'MANAGE',
    titulo: 'Incident response and monitoring',
    descripcion:
      'The system is monitored in production, and incidents are handled with defined response procedures and root-cause analysis.',
  },
  {
    id: 'nist-manage-communication',
    marco: 'nist',
    categoria: 'MANAGE',
    titulo: 'Communication and transparency',
    descripcion:
      'Risk information is communicated to stakeholders, and decisions about AI system use are documented and transparent.',
  },
] as const;

export const MARCOS: readonly {
  id: MarcoId;
  nombre: string;
  descripcion: string;
}[] = [
  {
    id: 'euaia',
    nombre: 'EU AI Act',
    descripcion:
      'Risk-based regulation of AI systems placed on the EU market: prohibited practices, high-risk obligations, transparency duties.',
  },
  {
    id: 'nist',
    nombre: 'NIST AI RMF',
    descripcion:
      'Voluntary framework to manage AI risks across the lifecycle: Govern, Map, Measure, Manage.',
  },
];

export function buscarCriterio(id: string): Criterio | undefined {
  return CRITERIOS.find((criterio) => criterio.id === id);
}

export function criteriosPorMarco(marco: MarcoId): Criterio[] {
  return CRITERIOS.filter((criterio) => criterio.marco === marco);
}
