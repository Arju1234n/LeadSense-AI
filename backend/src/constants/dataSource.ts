/**
 * Data Source Constants for Lead Origin Tracking
 *
 * CRITICAL: Per GrowEasy CRM spec, data_source must be one of these 5 real estate project names
 * or left blank if the lead doesn't belong to any specific project.
 */
export const DATA_SOURCE = {
  LEADS_ON_DEMAND: 'leads_on_demand',
  MERIDIAN_TOWER: 'meridian_tower',
  EDEN_PARK: 'eden_park',
  VARAH_SWAMY: 'varah_swamy',
  SARJAPUR_PLOTS: 'sarjapur_plots',
  BLANK: '', // Explicitly allow blank for generic leads
} as const;

export type DataSource = (typeof DATA_SOURCE)[keyof typeof DATA_SOURCE];

export const DATA_SOURCE_VALUES: DataSource[] = Object.values(DATA_SOURCE);

/**
 * Data Source Display Names
 */
export const DATA_SOURCE_LABELS: Record<DataSource, string> = {
  [DATA_SOURCE.LEADS_ON_DEMAND]: 'Leads on Demand',
  [DATA_SOURCE.MERIDIAN_TOWER]: 'Meridian Tower',
  [DATA_SOURCE.EDEN_PARK]: 'Eden Park',
  [DATA_SOURCE.VARAH_SWAMY]: 'Varah Swamy',
  [DATA_SOURCE.SARJAPUR_PLOTS]: 'Sarjapur Plots',
  [DATA_SOURCE.BLANK]: 'Generic / No Project',
};

/**
 * Default Data Source (blank = no project)
 */
export const DEFAULT_DATA_SOURCE: DataSource = DATA_SOURCE.BLANK;

/**
 * Validate Data Source
 */
export const isValidDataSource = (source: string): source is DataSource => {
  return DATA_SOURCE_VALUES.includes(source as DataSource);
};

/**
 * Normalize Data Source — AI-friendly fuzzy matching
 */
export const normalizeDataSource = (source: string): DataSource => {
  if (!source || source.trim() === '') return DATA_SOURCE.BLANK;

  const normalized = source.toLowerCase().trim().replace(/[\s-_]/g, '');

  // Exact match first
  if (isValidDataSource(source.trim())) {
    return source.trim() as DataSource;
  }

  // Fuzzy mapping for AI output variations
  const sourceMap: Record<string, DataSource> = {
    // Leads on Demand variants
    leadsondemand: DATA_SOURCE.LEADS_ON_DEMAND,
    leads: DATA_SOURCE.LEADS_ON_DEMAND,
    ondemand: DATA_SOURCE.LEADS_ON_DEMAND,
    lod: DATA_SOURCE.LEADS_ON_DEMAND,

    // Meridian Tower variants
    meridiantower: DATA_SOURCE.MERIDIAN_TOWER,
    meridian: DATA_SOURCE.MERIDIAN_TOWER,
    tower: DATA_SOURCE.MERIDIAN_TOWER,

    // Eden Park variants
    edenpark: DATA_SOURCE.EDEN_PARK,
    eden: DATA_SOURCE.EDEN_PARK,
    park: DATA_SOURCE.EDEN_PARK,

    // Varah Swamy variants
    varahswamy: DATA_SOURCE.VARAH_SWAMY,
    varah: DATA_SOURCE.VARAH_SWAMY,
    swamy: DATA_SOURCE.VARAH_SWAMY,

    // Sarjapur Plots variants
    sarjapurplots: DATA_SOURCE.SARJAPUR_PLOTS,
    sarjapur: DATA_SOURCE.SARJAPUR_PLOTS,
    plots: DATA_SOURCE.SARJAPUR_PLOTS,
  };

  return sourceMap[normalized] || DEFAULT_DATA_SOURCE;
};
