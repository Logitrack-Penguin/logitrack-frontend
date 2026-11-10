/** Id del mensaje de error de un FormField, para enlazarlo desde el input con aria-describedby. */
export function fieldErrorId(htmlFor: string) {
  return `${htmlFor}-error`;
}
