import {
  LinesRange,
  TextRange,
  MarkedLinesRange,
  MarkedTextRange
} from '../range';
import { isSerializableOfClass } from './isSerializableOfClass';
import { SerializableClassInstance } from './SerializableClassInstance';

export function rangeFromSerializable<
  T extends TextRange | MarkedTextRange | LinesRange | MarkedLinesRange
>(serializable: SerializableClassInstance<T>): T {
  if (isSerializableOfClass(serializable, TextRange)) {
    return TextRange.fromSerializable(serializable) as T;
  }

  if (isSerializableOfClass(serializable, LinesRange)) {
    return LinesRange.fromSerializable(serializable) as T;
  }

  if (isSerializableOfClass(serializable, MarkedTextRange)) {
    return MarkedTextRange.fromSerializable(serializable) as T;
  }

  if (isSerializableOfClass(serializable, MarkedLinesRange)) {
    return MarkedLinesRange.fromSerializable(serializable) as T;
  }

  throw new Error(`Unknown range serializable ${serializable}`);
}
