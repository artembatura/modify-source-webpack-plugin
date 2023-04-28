import {
  TextRange,
  LinesRange,
  MarkedTextRange,
  MarkedLinesRange
} from '../ranges';
import {
  rangeFromSerializable,
  SerializableClassInstance
} from '../serializable';
import { AbstractOperation } from './AbstractOperation';
import { fillConstantsInString } from './utils/fillConstantsInString';

export enum ReplaceStrategy {
  ALL = 'all',
  ONCE = 'once'
}

function applyReplaceLinesRangeOnce(
  sourceText: string,
  searchValue: MarkedLinesRange,
  replaceValue: string
): string | null {
  const lines = sourceText.split('\n');

  const startLineIndex = lines.findIndex(line =>
    line.includes(searchValue.startToken)
  );

  const endLineIndex = lines.findIndex(
    (line, lineIndex) =>
      lineIndex > startLineIndex && line.includes(searchValue.endToken)
  );

  if (startLineIndex === -1 || endLineIndex === -1) {
    return null;
  }

  const range = new LinesRange(startLineIndex, endLineIndex);

  return new ReplaceOperation(range, replaceValue, ReplaceStrategy.ONCE).apply(
    sourceText
  );
}

function applyReplaceTextRange(
  sourceText: string,
  searchValue: MarkedTextRange,
  replaceValue: string
): string | null {
  const startIndex = sourceText.indexOf(searchValue.startToken);
  const endIndex = sourceText.indexOf(searchValue.endToken, startIndex);

  if (startIndex === -1 || endIndex === -1) {
    return null;
  }

  return new ReplaceOperation(
    new TextRange(startIndex, endIndex + searchValue.endToken.length - 1),
    replaceValue,
    ReplaceStrategy.ONCE
  ).apply(sourceText);
}

export class ReplaceOperation extends AbstractOperation {
  SERIALIZABLE_CLASS = ReplaceOperation.name;

  constructor(
    public readonly searchValue:
      | string
      | TextRange
      | LinesRange
      | MarkedTextRange
      | MarkedLinesRange,
    public readonly replaceValue: string,
    public readonly repeatCount: number | ReplaceStrategy = ReplaceStrategy.ONCE
  ) {
    super();
  }

  public toSerializable(): SerializableClassInstance<ReplaceOperation> {
    const searchValue =
      typeof this.searchValue === 'string'
        ? this.searchValue
        : this.searchValue.toSerializable();

    return {
      SERIALIZABLE_CLASS: this.SERIALIZABLE_CLASS,
      searchValue,
      replaceValue: this.replaceValue,
      repeatCount: this.repeatCount
    };
  }

  static fromSerializable<TConstants extends Record<string, string | number>>(
    serializable: SerializableClassInstance<ReplaceOperation>,
    constants?: TConstants
  ): ReplaceOperation {
    const replaceValue = constants
      ? fillConstantsInString(serializable.replaceValue, constants)
      : serializable.replaceValue;

    const searchValue =
      typeof serializable.searchValue === 'string'
        ? serializable.searchValue
        : rangeFromSerializable(serializable.searchValue);

    return new ReplaceOperation(
      searchValue,
      replaceValue,
      serializable.repeatCount
    );
  }

  apply(sourceText: string): string {
    const searchValue = this.searchValue;

    if (typeof searchValue === 'string') {
      if (typeof this.repeatCount === 'number') {
        let newSource = sourceText;

        for (let i = this.repeatCount; i > 0; i--) {
          newSource = sourceText.replace(searchValue, this.replaceValue);
        }

        return newSource;
      }

      switch (this.repeatCount) {
        case ReplaceStrategy.ONCE:
          return sourceText.replace(searchValue, this.replaceValue);

        case ReplaceStrategy.ALL:
          return sourceText.replace(
            new RegExp(searchValue, 'g'),
            this.replaceValue
          );
      }
    }

    if (searchValue instanceof TextRange) {
      if (
        searchValue.startPos >= sourceText.length ||
        searchValue.endPos > sourceText.length
      ) {
        return sourceText;
      }

      if (searchValue.startPos >= searchValue.endPos) {
        return sourceText;
      }

      return (
        sourceText.slice(0, searchValue.startPos - 1) +
        this.replaceValue +
        sourceText.slice(searchValue.endPos, sourceText.length)
      );
    }

    if (searchValue instanceof LinesRange) {
      if (
        searchValue.startLinePos >= sourceText.length ||
        searchValue.endLinePos > sourceText.length
      ) {
        return sourceText;
      }

      if (searchValue.startLinePos >= searchValue.endLinePos) {
        return sourceText;
      }

      const lines = sourceText.split('\n');
      let valueHasReplaced = false;

      return lines.reduce((acc, line, lineIndex) => {
        if (
          lineIndex >= searchValue.startLinePos &&
          lineIndex <= searchValue.endLinePos
        ) {
          if (!valueHasReplaced) {
            valueHasReplaced = true;

            return acc + this.replaceValue;
          }

          return acc;
        }

        const isLastLine = lineIndex === lines.length - 1;
        const lineBreak = isLastLine ? '' : '\n';

        return acc + `${line}${lineBreak}`;
      }, '');
    }

    if (
      searchValue instanceof MarkedTextRange ||
      searchValue instanceof MarkedLinesRange
    ) {
      const doApplyOnce:
        | typeof applyReplaceTextRange
        | typeof applyReplaceLinesRangeOnce =
        searchValue instanceof MarkedTextRange
          ? applyReplaceTextRange
          : applyReplaceLinesRangeOnce;

      if (typeof this.repeatCount === 'number') {
        let newSourceText: string = sourceText;

        for (let i = this.repeatCount; i > 0; i--) {
          const result = doApplyOnce(
            newSourceText,
            searchValue,
            this.replaceValue
          );

          if (!result) {
            break;
          }

          newSourceText = result;
        }

        return newSourceText;
      }

      switch (this.repeatCount) {
        case ReplaceStrategy.ONCE: {
          const newSourceText = doApplyOnce(
            sourceText,
            searchValue,
            this.replaceValue
          );

          if (!newSourceText) {
            return sourceText;
          }

          return newSourceText;
        }

        case ReplaceStrategy.ALL: {
          let newSourceText: string = sourceText,
            continueLoop = true;

          while (continueLoop) {
            const result = doApplyOnce(
              newSourceText,
              searchValue,
              this.replaceValue
            );

            if (!result) {
              continueLoop = false;
              break;
            }

            newSourceText = result;
          }

          return newSourceText;
        }
      }
    }

    return sourceText;
  }
}
