import { AbstractSerializable } from './AbstractSerializable';
import { SerializableClassInstance } from './SerializableClassInstance';

export function isSerializableOfClass<T extends AbstractSerializable>(
  serializable: SerializableClassInstance<AbstractSerializable>,
  operation: { new (...args: any[]): T }
): serializable is SerializableClassInstance<T> {
  return serializable.SERIALIZABLE_CLASS === operation.name;
}
