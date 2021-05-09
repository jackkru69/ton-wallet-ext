export const validatePassword = (password: string) =>
  /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,64}$/.test(password) ||
  "Your password must be 6-64 characters, and include at least one lowercase letter, one uppercase letter, and a number.";
