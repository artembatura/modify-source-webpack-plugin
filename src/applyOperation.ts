import { isOperationInstanceOf } from './isOperationInstanceOf';
import {
  AbstractOperation,
  ConcatOperation,
  ReplaceOperation
} from './operations';

function throwUnknownOperationType(
  op: AbstractOperation,
  opType: string
): void {
  const allowedTypes = isOperationInstanceOf(op, ConcatOperation)
    ? ConcatOperation.getAllowedTypes()
    : ReplaceOperation.getAllowedTypes();

  throw new Error(
    `Incorrect operation type '${opType}' for ${
      op.constructor.name
    }. Allowed types: '${allowedTypes.join("', '")}'.`
  );
}

export function applyOperation(
  src: string,
  operation: AbstractOperation
): string {
  if (isOperationInstanceOf(operation, ConcatOperation)) {
    switch (operation.type) {
      case 'start':
        return operation.value + src;

      case 'end':
        return src + operation.value;

      default:
        throwUnknownOperationType(operation, operation.type);
    }
  } else if (isOperationInstanceOf(operation, ReplaceOperation)) {
    switch (operation.type) {
      case 'once':
        return src.replace(operation.searchValue, operation.replaceValue);

      case 'all':
        return src.replace(
          new RegExp(operation.searchValue, 'g'),
          operation.replaceValue
        );

      default:
        throwUnknownOperationType(operation, operation.type);
    }
  } else {
    throw new Error(
      'Unknown operation instance: ' + operation.constructor.name
    );
  }

  return src;
}
