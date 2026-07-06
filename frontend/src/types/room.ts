/**
 * Room domain types.
 * Represents a room within a society/project.
 */

export interface Room {
  id: string;
  name: string;
  image: string;
  icon: string;
  /** Names of modules/products featured in this room, shown on card hover. */
  assets?: string[];
}

/** A filter group used in the design-flow room filter screen. */
export interface FilterGroup {
  id: string;
  label: string;
  /** React icon component reference. */
  icon: React.ComponentType<{ size?: number; className?: string }>;
  options: string[];
}
