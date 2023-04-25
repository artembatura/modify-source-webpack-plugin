import { AbstractSerializable } from '../serializable/AbstractSerializable';

export abstract class AbstractOperation extends AbstractSerializable {
  public abstract apply(sourceText: string): string;
}
