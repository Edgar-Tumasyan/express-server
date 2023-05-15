/**
 * Declares IoC identifiers as symbols for declaration
 * and injection throughout the application.
 */
export const ContainerKeys = {
  dayJS: Symbol.for("dayJS"),
  envConfig: Symbol.for("envConfig"),
  requestService: Symbol.for("requestService"),
  apiRequestFactory: Symbol.for("apiRequestFactory")
};
