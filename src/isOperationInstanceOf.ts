import { AbstractOperation } from './operations';

export function isOperationInstanceOf<TInstance extends AbstractOperation>(
  instance: AbstractOperation,
  op: { new (...args: any[]): TInstance }
): instance is TInstance {
  return instance.constructor.name === op.name;
}
