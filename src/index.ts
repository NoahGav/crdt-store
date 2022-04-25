// The goal of crdt-store is to create javascript objects that can be
// synced across users however you want (websocket, api, peer-to-peer, ...),
// online or offline.

//-----------------------------------------------------

// import { z } from 'zod';

// type Schema = z.Schema;
// type Infer<TSchema extends Schema> = TSchema extends z.Schema ? z.infer<TSchema> : never;

// type Transaction<TSchema extends Schema, TInput extends Schema> = {
//   input: TInput;
//   handle: (store: Infer<TSchema>, input: Infer<TInput>) => void;
// };

// type AnyStore = Store<any>;

// export class Store<TSchema extends Schema> {
//   _def: {
//     schema: TSchema
//   };

//   constructor(def?: {
//     schema?: TSchema
//   }) {
//     this._def = {
//       schema: (def?.schema ?? {}) as TSchema
//     };
//   }

//   static create<
//     TSchema extends Schema
//   >(
//     schema: TSchema
//   ): Store<TSchema> {
//     return new Store({ schema });
//   }

//   transaction<
//     TName extends string,
//     TInput extends Schema
//   >(
//     name: TName,
//     transaction: Transaction<TSchema, TInput>
//   ): Store<TSchema> {
//     return new Store();
//   }
// }

// export abstract class Client {
//   static create<TStore extends AnyStore>(store: TStore): Infer<TStore['_def']['schema']> {
//     // TODO - Needs to return an proxy object with the type of the stores schema.
//     //        The proxy needs to be readonly and throw a runtime error if you call a function
//     //        like set.add(value) that modifes it. Transactions should not throw such errors.
//     //        It will also contain functions with the names of all the transactions
//     //        that takes the input schema. There needs to be a runtime and compile
//     //        time error if a property has the same name as the transaction.
//     //        If a client willfully attempts to do an illegal transaction the server must
//     //        reject it. The client will become out of sync, but that is their problem.
//     return {} as any;
//   }
// }

// const store = Store
//   .create(z.object({
//     name: z.string(),
//     users: z.set(z.string())
//   }))
//   .transaction('setName', {
//     input: z.string(),

//     handle(store, newName) {
//       store.name = newName;
//     }
//   }).transaction('addUser', {
//     input: z.string(),

//     handle(store, userId) {
//       store.users.add(userId);
//     }
//   });

// const client = Client.create(store);

// // store is a recursive proxy object that handles getting and setting of properties.
// // Whenever a setter is called a transaction is made. This transaction stores the changes
// // in a conflict-free way. A some point these changes can be synced with others and others
// // changes can be synced with us.

// // - Need to make sure that this store can be used by central servers or peer-to-peer.
// //
// // - Need a generic way of syncing between users. By generic I mean that you can do it however you
// //   want. You could use websockets, web-rtc, an api, or whatever. It just needs to be generic and simple.
// //
// // - Need to make sure the recursive proxy store object does not allow changes that do not adhere to the
// //   store's schema.
// //
// // - Strings will be treated as an array of chars. Arrays will be treated as documents where instertions and
// //   deletions are relative to where they happen instead of the actual index. This will make synchronizing text
// //   (or any array) very simple, yet reliable.