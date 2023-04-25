import { AbstractOperation } from '../AbstractOperation';
import { ConcatOperation, ReplaceOperation } from '../operations';
import { isSerializableOfClass } from './isSerializableOfClass';
import { SerializableClassInstance } from './SerializableClassInstance';

export function operationFromSerializable<
  TConstants extends Record<string, string | number>
>(
  serializable: SerializableClassInstance<any>,
  constants?: TConstants
): AbstractOperation {
  if (isSerializableOfClass(serializable, ReplaceOperation)) {
    return ReplaceOperation.fromSerializable(serializable, constants);
  }

  if (isSerializableOfClass(serializable, ConcatOperation)) {
    return ConcatOperation.fromSerializable(serializable, constants);
  }

  throw new Error(
    `Incorrect serializable provided: ${JSON.stringify(serializable)}`
  );
}
