import {
  AbstractSerializable,
  SerializableClassInstance
} from '../serializable';

export class TextLinesRange extends AbstractSerializable {
  SERIALIZABLE_CLASS = TextLinesRange.name;

  constructor(
    public readonly startIndex: number,
    public readonly endIndex: number
  ) {
    super();
  }

  public toSerializable(): SerializableClassInstance<TextLinesRange> {
    return {
      SERIALIZABLE_CLASS: this.SERIALIZABLE_CLASS,
      startIndex: this.startIndex,
      endIndex: this.endIndex
    };
  }

  public static fromSerializable(
    serializable: SerializableClassInstance<TextLinesRange>
  ): TextLinesRange {
    return new TextLinesRange(serializable.startIndex, serializable.endIndex);
  }
}
