// Shared password policy for the admin panel: at least 8 characters,
// with a letter, a number and a special character.
export const PASSWORD_MIN_LENGTH = 8;

export function getPasswordConditionErrors(password) {
  const errors = [];
  if (!/[A-Za-z]/.test(password)) errors.push('Character not included');
  if (!/[0-9]/.test(password)) errors.push('Number not included');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Special character not included');
  return errors;
}

export function isPasswordTooShort(password) {
  return !password || password.length < PASSWORD_MIN_LENGTH;
}
