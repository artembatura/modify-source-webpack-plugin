import { AbstractSerializable } from '../serializable';

export abstract class AbstractOperation extends AbstractSerializable {
  public abstract apply(sourceText: string): string;
}
