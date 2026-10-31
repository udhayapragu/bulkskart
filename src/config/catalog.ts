/**
 * Sample-catalogue switch.
 *
 * Off by default, so public pages show only records from the database.
 * The sample suppliers, products and auctions in src/data are for local
 * demos only. Enable with VITE_SAMPLE_CATALOG=true in a local .env file.
 */
export const SAMPLE_CATALOG_ENABLED =
  String(import.meta.env.VITE_SAMPLE_CATALOG ?? 'false').toLowerCase() === 'true';
