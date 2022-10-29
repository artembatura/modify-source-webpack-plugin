const { getOptions } = require('loader-utils');
const path = require('path');
const { validate } = require('schema-utils');

const { applyOperation } = require('./applyOperation');

/**
 * @typedef {Object} LoaderOptions
 * @property {AbstractOperation[]} operations
 * @property {string} moduleRequest
 */

const schema = {
  type: 'object',
  properties: {
    moduleRequest: {
      type: 'string'
    },
    operations: {
      type: 'array',
      items: {
        type: 'object'
      }
    }
  },
  additionalProperties: false
};

/**
 * @param {string} src
 * @param {string} moduleRequest
 * @returns {string}
 */
function fillVariables(src, moduleRequest) {
  const cleanPath = moduleRequest.split('?')[0];
  const fileName = path.basename(cleanPath);

  // TODO: variables should be filled not in whole file, ONLY in operations values
  // TODO: replace \ to / when replacing variables
  return src
    .replace(/\$FILE_PATH/g, cleanPath)
    .replace(/\$FILE_NAME/g, fileName);
}

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

  const result = options.operations.reduce(
    (src, operation) => applyOperation(src, operation),
    source
  );

  return fillVariables(result, options.moduleRequest);
};
