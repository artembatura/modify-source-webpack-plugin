import { AbstractSerializable } from '../AbstractSerializable';
import { SerializableClassInstance } from '../types';

export class TextRange extends AbstractSerializable {
  SERIALIZABLE_CLASS = 'TextRange';

  constructor(
    public readonly startPos: number,
    public readonly endPos: number
  ) {
    super();
  }

  public toSerializable(): SerializableClassInstance<TextRange> {
    return {
      SERIALIZABLE_CLASS: this.SERIALIZABLE_CLASS,
      startPos: this.startPos,
      endPos: this.endPos
    };
  }

  public static fromSerializable(
    serializable: SerializableClassInstance<TextRange>
  ): TextRange {
    return new TextRange(serializable.startPos, serializable.endPos);
  }
}
