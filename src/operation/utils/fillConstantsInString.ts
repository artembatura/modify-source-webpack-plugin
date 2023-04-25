export function fillConstantsInString<
  TConstants extends Record<string, string | number>
>(textValue: string, constants: TConstants): string {
  let newTextValue = textValue;

  Object.keys(constants).forEach(constant => {
    const constantValue = String(constants[constant]);

    newTextValue = textValue.replace(
      new RegExp(`\\$${constant}`, 'g'),
      constantValue
    );
  });

  return newTextValue;
}
