const { getOptions } = require('loader-utils');
const { validate } = require('schema-utils');

const schema = {
  type: 'object',
  properties: {
    filename: {
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
    name: 'ModifyModuleSourceLoader',
    baseDataPath: 'options'
  });

  const modify = global.modifyFunctions
    ? global.modifyFunctions[options.ruleIndex]
    : null;

  if (!modify) {
    throw new Error(
      `global.modifyFunctions[${options.ruleIndex}] is not defined.`
    );
  }

  return modify(source, options.filename);
};
