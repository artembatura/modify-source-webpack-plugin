import { LinesRange } from '../range/LinesRange';
import { LinesRangeMarkerGroup } from '../range/LinesRangeMarkerGroup';
import { TextRange } from '../range/TextRange';
import { TextRangeMarkerGroup } from '../range/TextRangeMarkerGroup';
import { SerializableClassInstance } from '../types';
import { isSerializableOfClass } from './isSerializableOfClass';

export function rangeFromSerializable<
  T extends
    | TextRange
    | TextRangeMarkerGroup
    | LinesRange
    | LinesRangeMarkerGroup
>(serializable: SerializableClassInstance<T>): T {
  if (isSerializableOfClass(serializable, TextRange)) {
    return TextRange.fromSerializable(serializable) as T;
  }

  if (isSerializableOfClass(serializable, LinesRange)) {
    return LinesRange.fromSerializable(serializable) as T;
  }

  if (isSerializableOfClass(serializable, TextRangeMarkerGroup)) {
    return TextRangeMarkerGroup.fromSerializable(serializable) as T;
  }

  if (isSerializableOfClass(serializable, LinesRangeMarkerGroup)) {
    return LinesRangeMarkerGroup.fromSerializable(serializable) as T;
  }

  throw new Error(`Unknown range serializable ${serializable}`);
}
