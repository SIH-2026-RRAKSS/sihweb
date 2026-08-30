export class InputValidator {
  private static ENTITY_ID_REGEX = /^[A-Za-z0-9_-]+$/;
  private static MAX_ENTITY_ID_LENGTH = 32;

  private static SEARCH_QUERY_REGEX = /^[A-Za-z0-9 _.,#-]+$/;
  private static MAX_SEARCH_LENGTH = 100;

  /**
   * Validates an entity ID or search query before sending to the backend.
   * Prevents SQL injection and excessive payload lengths.
   */
  public static validateEntityId(id: string): { isValid: boolean; error?: string } {
    if (!id || id.trim() === '') {
      return { isValid: false, error: 'Input cannot be empty' };
    }
    
    if (id.length > this.MAX_ENTITY_ID_LENGTH) {
      return { isValid: false, error: `Input exceeds maximum length of ${this.MAX_ENTITY_ID_LENGTH} characters` };
    }
    
    if (!this.ENTITY_ID_REGEX.test(id)) {
      return { isValid: false, error: 'Input contains invalid characters. Only alphanumeric, dashes, and underscores allowed.' };
    }
    
    return { isValid: true };
  }

  public static validateSearchQuery(query: string): { isValid: boolean; error?: string } {
    if (!query || query.trim() === '') {
      return { isValid: true }; // Empty search is valid (clears filter)
    }
    
    if (query.length > this.MAX_SEARCH_LENGTH) {
      return { isValid: false, error: `Search query exceeds maximum length of ${this.MAX_SEARCH_LENGTH} characters` };
    }
    
    if (!this.SEARCH_QUERY_REGEX.test(query)) {
      return { isValid: false, error: 'Search contains invalid characters. (SQL wildcards like % and _ are not allowed)' };
    }
    
    return { isValid: true };
  }

  /**
   * Validates network hop parameters to prevent backend memory exhaustion
   */
  public static validateHops(hops: number): { isValid: boolean; error?: string } {
    if (hops < 1 || hops > 10) {
      return { isValid: false, error: 'Hop count must be between 1 and 10' };
    }
    return { isValid: true };
  }
}
