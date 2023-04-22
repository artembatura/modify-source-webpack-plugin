import { AbstractSerializable } from '../AbstractSerializable';

type Primitive = string | number | boolean | null | undefined;

type PrimitiveArray = Primitive[] | PrimitiveObject[];

type PrimitiveObject = {
  [K: string]: Primitive | PrimitiveArray | PrimitiveObject;
};

/*
export type SerializableOperation<T extends AbstractOperation = any> = {
  id: string;
} & {
  [K in keyof T as T[K] extends Primitive | PrimitiveArray | PrimitiveObject
    ? K
    : never]: T[K];
};*/

export type SerializableClassInstance<T> = T extends AbstractSerializable
  ? {
      [K in keyof T as T[K] extends (...args: any[]) => any
        ? never
        : K]: SerializableClassInstance<T[K]>;
    }
  : T;
