export const INSTRUMENTS = [
  "Tenor",
  "Double Tenors",
  "Double Seconds",
  "Cello",
  "Bass",
  "Drum Set",
  "Percussion"
];

/** The five screens in the bottom nav. */
export type TabId = "master" | "personnel" | "repertoire" | "performances" | "matrix";

/** Magic performanceId for the default per-song lineup, used as a template
 *  when a gig has no assignments of its own. */
export const DEFAULT_COVERAGE_ID = "default_coverage";
