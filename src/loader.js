const { getOptions } = require('loader-utils');
const path = require('path');
const { validate } = require('schema-utils');

const { Operation } = require('./operations');

/** @typedef { import('./operations/AbstractOperation').SerializableOperation } SerializableOperation */

/**
 * @typedef {Object} LoaderOptions
 * @property {SerializableOperation[]} operations
 * @property {string} moduleRequest
 * @property {Record<string, string | number>} constants
 */

const schema = {
  type: 'object',
  properties: {
    operations: {
      type: 'array',
      items: {
        type: 'object'
      }
    },
    moduleRequest: {
      type: 'string'
    },
    constants: {
      type: 'object'
    }
  },
  additionalProperties: false
};

/**
 * @param {string} source
 * @returns {string}
 */
module.exports = function modifyModuleSourceLoader(source) {
  /**
   * @type {LoaderOptions}
   */
  const options = getOptions(this);

  validate(schema, options, {
    name: 'ModifySourcePlugin webpack loader'
  });

  const cleanPath = options.moduleRequest.split('?')[0];
  const fileName = path.basename(cleanPath);

  return options.operations.reduce((sourceText, serializableOp) => {
    const operation = Operation.fillConstants(
      Operation.fromSerializable(serializableOp),
      {
        ...options.constants,
        FILE_PATH: cleanPath,
        FILE_NAME: fileName
      }
    );

    return Operation.apply(sourceText, operation);
  }, source);
};
