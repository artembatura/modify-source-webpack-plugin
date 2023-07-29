export type NormalModuleLoader<TOptions = any> = {
  loader: string;
  options: TOptions | string;
  ident?: string;
  type?: string;
};
