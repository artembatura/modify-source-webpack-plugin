import { AbstractSerializable } from '../AbstractSerializable';
import { SerializableClassInstance } from '../serializable';

export class LinesRange extends AbstractSerializable {
  SERIALIZABLE_CLASS = 'LinesRange';

  constructor(
    public readonly startLinePos: number,
    public readonly endLinePos: number
  ) {
    super();
  }

  public toSerializable(): SerializableClassInstance<LinesRange> {
    return {
      SERIALIZABLE_CLASS: this.SERIALIZABLE_CLASS,
      startLinePos: this.startLinePos,
      endLinePos: this.endLinePos
    };
  }

  public static fromSerializable(
    serializable: SerializableClassInstance<LinesRange>
  ): LinesRange {
    return new LinesRange(serializable.startLinePos, serializable.endLinePos);
  }
}
