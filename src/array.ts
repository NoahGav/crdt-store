// import * as Y from 'yjs';

// export class StoreArray {
//   public static create(doc: Y.Doc, key: string) {
//     // Get the yjs array.
//     const yArray = doc.getArray(key);

//     // Create the array's implementation.
//     const array = this.array(yArray);

//     // Create and return the proxy.
//     return this.proxy(array, yArray);
//   }

//   private static array(yArray: Y.Array<unknown>) {
//     const array = {} as Record<string, any>;
//     return array;
//   }

//   private static proxy(array: Record<string, any>, yArray: Y.Array<unknown>) {
//     const proxy = new Proxy(array, {
//       get(target, p) {
//         if (typeof p === 'string') {
//           // Check if the key is an index into the array.
//           const index = parseInt(p);
//           if (!isNaN(index)) return yArray.get(index);

//           return array[p];
//         }
//       }
//     });

//     return proxy;
//   }
// }