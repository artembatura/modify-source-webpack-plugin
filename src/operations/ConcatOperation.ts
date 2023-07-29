import { SerializableClassInstance } from '../serializable';
import { AbstractOperation } from './AbstractOperation';
import { fillConstantsInString } from './utils/fillConstantsInString';

export enum ConcatPosition {
  START = 'start',
  END = 'end'
}

export class ConcatOperation extends AbstractOperation {
  SERIALIZABLE_CLASS = ConcatOperation.name;

  constructor(
    public readonly position: ConcatPosition,
    public readonly value: string
  ) {
    super();
  }

  public toSerializable(): SerializableClassInstance<ConcatOperation> {
    return {
      SERIALIZABLE_CLASS: this.SERIALIZABLE_CLASS,
      position: this.position,
      value: this.value
    };
  }

  static fromSerializable<TConstants extends Record<string, string | number>>(
    serializable: SerializableClassInstance<ConcatOperation>,
    constants?: TConstants
  ): ConcatOperation {
    const value = constants
      ? fillConstantsInString(serializable.value, constants)
      : serializable.value;

    return new ConcatOperation(serializable.position, value);
  }

  public apply(sourceText: string): string {
    switch (this.position) {
      case ConcatPosition.START:
        return this.value + sourceText;

      case ConcatPosition.END:
        return sourceText + this.value;
    }
  }
}
