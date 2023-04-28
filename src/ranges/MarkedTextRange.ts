import {
  AbstractSerializable,
  SerializableClassInstance
} from '../serializable';

export class MarkedTextRange extends AbstractSerializable {
  SERIALIZABLE_CLASS = MarkedTextRange.name;

  constructor(
    public readonly startToken: string,
    public readonly endToken: string
  ) {
    super();
  }

  public toSerializable(): SerializableClassInstance<MarkedTextRange> {
    return {
      SERIALIZABLE_CLASS: this.SERIALIZABLE_CLASS,
      startToken: this.startToken,
      endToken: this.endToken
    };
  }

  public static fromSerializable(
    serializable: SerializableClassInstance<MarkedTextRange>
  ): MarkedTextRange {
    return new MarkedTextRange(serializable.startToken, serializable.endToken);
  }
}
