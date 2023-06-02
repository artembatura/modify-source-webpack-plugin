import {
  AbstractSerializable,
  SerializableClassInstance
} from '../serializable';

export class TextSection extends AbstractSerializable {
  SERIALIZABLE_CLASS = TextSection.name;

  constructor(
    public readonly startToken: string,
    public readonly endToken: string
  ) {
    super();
  }

  public toSerializable(): SerializableClassInstance<TextSection> {
    return {
      SERIALIZABLE_CLASS: this.SERIALIZABLE_CLASS,
      startToken: this.startToken,
      endToken: this.endToken
    };
  }

  public static fromSerializable(
    serializable: SerializableClassInstance<TextSection>
  ): TextSection {
    return new TextSection(serializable.startToken, serializable.endToken);
  }
}
