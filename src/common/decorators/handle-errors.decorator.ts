import { ForbiddenException } from '@nestjs/common';

/**
 * Decorador que trata automaticamente erros comuns em controllers
 * Converte erros 401 em ForbiddenException com mensagem apropriada
 */
export function HandleErrors(message = 'Acesso restrito') {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor,
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      try {
        return await method.apply(this, args);
      } catch (error) {
        if (error.status === 401) {
          throw new ForbiddenException(message);
        }
        throw error;
      }
    };
  };
}
