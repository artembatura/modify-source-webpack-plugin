const { getOptions } = require('loader-utils');
const { validate } = require('schema-utils');

const schema = {
  type: 'object',
  properties: {
    path: {
      type: 'string'
    },
    ruleIndex: {
      type: 'number'
    }
  },
  additionalProperties: false
};

module.exports = function modifyModuleSourceLoader(source) {
  const options = getOptions(this);

  validate(schema, options, {
    name: 'ModifySourcePlugin Loader'
  });

  const modify = global.modifyFunctions
    ? global.modifyFunctions[options.ruleIndex]
    : null;

  if (!modify) {
    throw new Error(
      `Modify function at index ${options.ruleIndex} is not defined in global space.`
    );
  }

  return modify(source, options.path);
};
