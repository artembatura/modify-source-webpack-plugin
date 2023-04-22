import { AbstractSerializable } from '../AbstractSerializable';
import { SerializableClassInstance } from '../types';

export class LinesRangeMarkerGroup extends AbstractSerializable {
  SERIALIZABLE_CLASS = 'LinesRangeMarkerGroup';

  constructor(
    public readonly startToken: string,
    public readonly endToken: string
  ) {
    super();
  }

  public toSerializable(): SerializableClassInstance<LinesRangeMarkerGroup> {
    return {
      SERIALIZABLE_CLASS: this.SERIALIZABLE_CLASS,
      startToken: this.startToken,
      endToken: this.endToken
    };
  }

  public static fromSerializable(
    serializable: SerializableClassInstance<LinesRangeMarkerGroup>
  ): LinesRangeMarkerGroup {
    return new LinesRangeMarkerGroup(
      serializable.startToken,
      serializable.endToken
    );
  }
}
