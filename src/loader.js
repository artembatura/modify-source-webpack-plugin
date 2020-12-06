const { getOptions } = require('loader-utils');
const { validate } = require('schema-utils');

const schema = {
  type: 'object',
  properties: {
    filename: {
      type: 'string'
    },
    modify: {
      instanceof: 'Function'
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

  return options.modify(source, options.filename);
};
