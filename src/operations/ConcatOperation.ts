import { AbstractOperation } from '../AbstractOperation';
import { fillStringWithConstants } from '../fillStringWithConstants';
import { SerializableClassInstance } from '../types';

export enum ConcatOperationStrategy {
  START = 'start',
  END = 'end'
}

export class ConcatOperation extends AbstractOperation {
  SERIALIZABLE_CLASS = 'ConcatOperation';

  constructor(
    public readonly strategy: ConcatOperationStrategy,
    public readonly value: string
  ) {
    super();
  }

  public toSerializable(): SerializableClassInstance<ConcatOperation> {
    return {
      SERIALIZABLE_CLASS: this.SERIALIZABLE_CLASS,
      strategy: this.strategy,
      value: this.value
    };
  }

  static fromSerializable<TConstants extends Record<string, string | number>>(
    serializable: SerializableClassInstance<ConcatOperation>,
    constants?: TConstants
  ): ConcatOperation {
    const value = constants
      ? fillStringWithConstants(serializable.value, constants)
      : serializable.value;

    return new ConcatOperation(serializable.strategy, value);
  }

  apply(sourceText: string): string {
    switch (this.strategy) {
      case ConcatOperationStrategy.START:
        return this.value + sourceText;

      case ConcatOperationStrategy.END:
        return sourceText + this.value;
    }
  }
}
