/**
 * Gera uma senha aleatória com a estrutura especificada
 * @param length Tamanho da senha (padrão: 8)
 * @returns Senha aleatória
 */
export function generateRandomPassword(length: number = 8): string {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*';

  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;

  // Garantir pelo menos um caractere de cada tipo
  let password = '';
  password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
  password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
  password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
  password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));

  // Preencher o resto da senha
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }

  // Embaralhar a senha
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}
