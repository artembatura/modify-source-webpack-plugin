import { LinesRange } from '../range/LinesRange';
import { MarkedLinesRange } from '../range/MarkedLinesRange';
import { MarkedTextRange } from '../range/MarkedTextRange';
import { TextRange } from '../range/TextRange';
import { SerializableClassInstance } from '../types';
import { isSerializableOfClass } from './isSerializableOfClass';

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
