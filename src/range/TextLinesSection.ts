import {
  AbstractSerializable,
  SerializableClassInstance
} from '../serializable';

export class TextLinesSection extends AbstractSerializable {
  SERIALIZABLE_CLASS = TextLinesSection.name;

  constructor(
    public readonly startToken: string,
    public readonly endToken: string
  ) {
    super();
  }

  public toSerializable(): SerializableClassInstance<TextLinesSection> {
    return {
      SERIALIZABLE_CLASS: this.SERIALIZABLE_CLASS,
      startToken: this.startToken,
      endToken: this.endToken
    };
  }

  public static fromSerializable(
    serializable: SerializableClassInstance<TextLinesSection>
  ): TextLinesSection {
    return new TextLinesSection(serializable.startToken, serializable.endToken);
  }
}
