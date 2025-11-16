import { validate as uuidValidate } from 'uuid';

/**
 * Validates if a given string is a valid UUID.
 * @param id - The string to validate.
 * @returns True if the string is a valid UUID, false otherwise.
 */
export function validateUUID(id: string): boolean {
  return uuidValidate(id);
}