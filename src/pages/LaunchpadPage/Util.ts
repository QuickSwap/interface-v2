export function isValidEmail(email: string): boolean {
  return email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g) ? true : false;
}
