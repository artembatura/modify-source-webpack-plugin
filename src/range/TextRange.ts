import {
  AbstractSerializable,
  SerializableClassInstance
} from '../serializable';

export class TextRange extends AbstractSerializable {
  SERIALIZABLE_CLASS = TextRange.name;

  constructor(
    public readonly startIndex: number,
    public readonly endIndex: number
  ) {
    super();
  }

  public toSerializable(): SerializableClassInstance<TextRange> {
    return {
      SERIALIZABLE_CLASS: this.SERIALIZABLE_CLASS,
      startIndex: this.startIndex,
      endIndex: this.endIndex
    };
  }

  public static fromSerializable(
    serializable: SerializableClassInstance<TextRange>
  ): TextRange {
    return new TextRange(serializable.startIndex, serializable.endIndex);
  }
}
