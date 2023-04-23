import { AbstractSerializable } from '../AbstractSerializable';
import { SerializableClassInstance } from '../types';

export class TextRangeMarked extends AbstractSerializable {
  SERIALIZABLE_CLASS = 'TextRangeMarkerGroup';

  constructor(
    public readonly startToken: string,
    public readonly endToken: string
  ) {
    super();
  }

  public toSerializable(): SerializableClassInstance<TextRangeMarked> {
    return {
      SERIALIZABLE_CLASS: this.SERIALIZABLE_CLASS,
      startToken: this.startToken,
      endToken: this.endToken
    };
  }

  public static fromSerializable(
    serializable: SerializableClassInstance<TextRangeMarked>
  ): TextRangeMarked {
    return new TextRangeMarked(serializable.startToken, serializable.endToken);
  }
}
