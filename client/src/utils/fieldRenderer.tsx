import { VolunteerData } from '../types/modelSchema';

/**
 * Renders field data with special handling for complex fields like recommended_match
 * @param key - The field key
 * @param data - The field data to render
 * @returns Formatted string representation of the data
 */
export const renderField = (key: string, data: any): string => {
  const keyToCheck: keyof VolunteerData = "recommended_match";
  if (key === keyToCheck && Array.isArray(data)) {
    return data.map(
      (item: any) => `${item.name} (${item.count})`
    ).join(", ");
  } else {
    return data?.toString() || '';
  }
}; 