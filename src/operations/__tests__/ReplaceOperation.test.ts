import { MarkedLinesRange } from '../../range/MarkedLinesRange';
import { ReplaceOperation, ReplaceStrategy } from '../ReplaceOperation';

describe('ReplaceOperation', () => {
  it('searchValue=LinesRangeMarkerGroup, replaceCount=once', () => {
    const text = `
      /* @REPLACE_START */
        class FooBar {
          test() {
            throw new Error();
          }
        }
      /* @REPLACE_END */
      `.trim();

    const result = new ReplaceOperation(
      new MarkedLinesRange('/* @REPLACE_START */', '/* @REPLACE_END */'),
      'console.log("Hello world!");',
      ReplaceStrategy.ONCE
    ).apply(text);

    expect(result).toEqual('console.log("Hello world!");');
  });

  it('searchValue=LinesRangeMarkerGroup, replaceCount=once many markers', () => {
    const text = `
      /* @REPLACE_START */
        class FooBar {
          test() {
            throw new Error();
          }
        }
      /* @REPLACE_END */
      /* @REPLACE_START */
        class FooBar {
          test() {
            throw new Error();
          }
        }
      /* @REPLACE_END */
      /* @REPLACE_START */
        class FooBar {
          test() {
            throw new Error();
          }
        }
      /* @REPLACE_END */
    `;

    const result = new ReplaceOperation(
      new MarkedLinesRange('/* @REPLACE_START */', '/* @REPLACE_END */'),
      'console.log("Hello world!");\n',
      ReplaceStrategy.ONCE
    ).apply(text);

    expect(result).toEqual(`
console.log("Hello world!");
      /* @REPLACE_START */
        class FooBar {
          test() {
            throw new Error();
          }
        }
      /* @REPLACE_END */
      /* @REPLACE_START */
        class FooBar {
          test() {
            throw new Error();
          }
        }
      /* @REPLACE_END */
    `);
  });

  it('searchValue=LinesRangeMarkerGroup, replaceCount=2', () => {
    const text = `
      /* @REPLACE_START */
        class FooBar {
          test() {
            throw new Error();
          }
        }
      /* @REPLACE_END */
      /* @REPLACE_OTHER_START */
        class FooBar {
          test() {
            throw new Error();
          }
        }
      /* @REPLACE_OTHER_END */
      /* @REPLACE_START */
        class FooBar {
          test() {
            throw new Error();
          }
        }
      /* @REPLACE_END */
    `;

    const result = new ReplaceOperation(
      new MarkedLinesRange('/* @REPLACE_START */', '/* @REPLACE_END */'),
      'console.log("Hello world!");\n',
      3
    ).apply(text);

    expect(result).toEqual(
      `
console.log("Hello world!");
      /* @REPLACE_OTHER_START */
        class FooBar {
          test() {
            throw new Error();
          }
        }
      /* @REPLACE_OTHER_END */
console.log("Hello world!");
    `
    );
  });
});
