import { SerializableClassInstance } from './SerializableClassInstance';

export abstract class AbstractSerializable {
  public abstract SERIALIZABLE_CLASS: string;

  public abstract toSerializable(): SerializableClassInstance<any>;
}
