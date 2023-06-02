import {
  TextLinesRange,
  TextRange,
  TextLinesSection,
  TextSection
} from '../range';
import { isSerializableOfClass } from './isSerializableOfClass';
import { SerializableClassInstance } from './SerializableClassInstance';

export function rangeFromSerializable<
  T extends TextRange | TextSection | TextLinesRange | TextLinesSection
>(serializable: SerializableClassInstance<T>): T {
  if (isSerializableOfClass(serializable, TextRange)) {
    return TextRange.fromSerializable(serializable) as T;
  }

  if (isSerializableOfClass(serializable, TextLinesRange)) {
    return TextLinesRange.fromSerializable(serializable) as T;
  }

  if (isSerializableOfClass(serializable, TextSection)) {
    return TextSection.fromSerializable(serializable) as T;
  }

  if (isSerializableOfClass(serializable, TextLinesSection)) {
    return TextLinesSection.fromSerializable(serializable) as T;
  }

  throw new Error(`Unknown range serializable ${serializable}`);
}
