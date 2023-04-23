import { AbstractSerializable } from '../AbstractSerializable';
import { SerializableClassInstance } from '../types';

export class LinesRangeMarked extends AbstractSerializable {
  SERIALIZABLE_CLASS = 'LinesRangeMarkerGroup';

  constructor(
    public readonly startToken: string,
    public readonly endToken: string
  ) {
    super();
  }

  public toSerializable(): SerializableClassInstance<LinesRangeMarked> {
    return {
      SERIALIZABLE_CLASS: this.SERIALIZABLE_CLASS,
      startToken: this.startToken,
      endToken: this.endToken
    };
  }

  public static fromSerializable(
    serializable: SerializableClassInstance<LinesRangeMarked>
  ): LinesRangeMarked {
    return new LinesRangeMarked(serializable.startToken, serializable.endToken);
  }
}
