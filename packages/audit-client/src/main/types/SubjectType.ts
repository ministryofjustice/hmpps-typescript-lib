export type AllSubjectTypes =
  | SubjectType
  /**
   * There are no personal details on this audit,  or is not appropriate for the page being viewed
   */
  | 'NOT_APPLICABLE'

export type SubjectType =
  /**
   * The subject of the Audit Event is a NOMIS Prisoner reference
   * Commonly used by HMPPS Digital Services used in Prison
   */
  | 'PRISONER_ID'
  /**
   * The subject of the Audit Event is an NDelius CRN
   * Commonly used by HMPPS Digital Services used in Probation
   */
  | 'CRN'

  /**
   * The subject of the Audit Event is something the user has searched for
   * Commonly used by all HMPPS Digital Services
   */
  | 'SEARCH_TERM'

  /**
   * The subject of the Audit Event is a staff member or external user ID
   * Infrequently used - only used by user/account management services/ Please speak to the HAA team if you want to record events with this Subject Type
   */
  | 'USER_ID'
