import { AbstractSerializable } from '../AbstractSerializable';
import { SerializableClassInstance } from '../types';

export class TextRangeMarkerGroup extends AbstractSerializable {
  SERIALIZABLE_CLASS = 'TextRangeMarkerGroup';

  constructor(
    public readonly startToken: string,
    public readonly endToken: string
  ) {
    super();
  }

  public toSerializable(): SerializableClassInstance<TextRangeMarkerGroup> {
    return {
      SERIALIZABLE_CLASS: this.SERIALIZABLE_CLASS,
      startToken: this.startToken,
      endToken: this.endToken
    };
  }

  public static fromSerializable(
    serializable: SerializableClassInstance<TextRangeMarkerGroup>
  ): TextRangeMarkerGroup {
    return new TextRangeMarkerGroup(
      serializable.startToken,
      serializable.endToken
    );
  }
}
