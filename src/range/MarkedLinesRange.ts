import { SerializableClassInstance } from '../serializable';
import { AbstractSerializable } from '../serializable/AbstractSerializable';

export class MarkedLinesRange extends AbstractSerializable {
  SERIALIZABLE_CLASS = 'LinesRangeMarkerGroup';

  constructor(
    public readonly startToken: string,
    public readonly endToken: string
  ) {
    super();
  }

  public toSerializable(): SerializableClassInstance<MarkedLinesRange> {
    return {
      SERIALIZABLE_CLASS: this.SERIALIZABLE_CLASS,
      startToken: this.startToken,
      endToken: this.endToken
    };
  }

  public static fromSerializable(
    serializable: SerializableClassInstance<MarkedLinesRange>
  ): MarkedLinesRange {
    return new MarkedLinesRange(serializable.startToken, serializable.endToken);
  }
}
