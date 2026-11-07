import { registerDecorator } from 'class-validator';
export function PasswordBytes() {
  return (object: object, propertyName: string) =>
    registerDecorator({
      name: 'passwordBytes',
      target: object.constructor,
      propertyName,
      options: { message: 'A senha deve ter no máximo 72 bytes em UTF-8.' },
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && Buffer.byteLength(value, 'utf8') <= 72,
      },
    });
}
