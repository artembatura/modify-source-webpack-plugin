import { LinesRange } from '../range/LinesRange';
import { LinesRangeMarked } from '../range/LinesRangeMarked';
import { TextRange } from '../range/TextRange';
import { TextRangeMarked } from '../range/TextRangeMarked';
import { SerializableClassInstance } from '../types';
import { isSerializableOfClass } from './isSerializableOfClass';

export function rangeFromSerializable<
  T extends TextRange | TextRangeMarked | LinesRange | LinesRangeMarked
>(serializable: SerializableClassInstance<T>): T {
  if (isSerializableOfClass(serializable, TextRange)) {
    return TextRange.fromSerializable(serializable) as T;
  }

  if (isSerializableOfClass(serializable, LinesRange)) {
    return LinesRange.fromSerializable(serializable) as T;
  }

  if (isSerializableOfClass(serializable, TextRangeMarked)) {
    return TextRangeMarked.fromSerializable(serializable) as T;
  }

  if (isSerializableOfClass(serializable, LinesRangeMarked)) {
    return LinesRangeMarked.fromSerializable(serializable) as T;
  }

  throw new Error(`Unknown range serializable ${serializable}`);
}
