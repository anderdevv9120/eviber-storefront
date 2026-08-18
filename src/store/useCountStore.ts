// *** Template for a store ***

import { State, StateCreator, create } from "zustand";
// import { persist } from "zustand/middleware";

interface CountStore {
  count: number;
  counts: number[];
  setCount: (count: number) => void;
  setCountAsync: (count: number) => Promise<void>;
}

// *** Zustand compared to Redux:
// 1. Little boilerplate
// 2. No provider needed
// 3. Faster than context?
// 4. State merging by default (no need to use combineReducer)
// 5. Extendable by default
// 6. Flexible to follow / Little opinionated

// The custom hook from zustand is not necessarily used in a Component or other hooks, it can be used any where
export const useCountStore = create<CountStore>()(
  // persist( // a persist middleware like redux-persist
  (set) => ({
    count: 0,
    counts: [1, 2, 3, 4],
    setCount: (count) => set(() => ({ count })),
    setCountUsingOldState: () => set((state) => ({ count: state.count + 1 })),
    setCountAsync: async (count) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      set(() => ({ count }));
    },
    setCounts: () => set((state) => ({ counts: [...state.counts, 10] }), false),
    // replace: false -> tell zustand not to replace the whole store with new states, just what we want to update
    // We can also use immer to update the state by simply modifying the current state
    // This is quite helpful when we want to update an object/array that is deeply nested without spreading them
  })
  //   {
  //     name: "count-store", // unique name of the store
  //     getStorage: () => localStorage, // or sessionStorage or any other storage provider
  //   },
  // ),
);

// *** Zustand also provides subscribe() method to subscribe to the store changes (or just a state changes) (if changes detected, we do something)
// or simply use it to store value globally in ref without causing re-rendering
// We can use it as a middleware

// *** We can easily create a custom middleware:
// TState represents the state shape, and you extend it from State to ensure it's a valid Zustand state.
// TStateCreator is the type of the function that creates the state, adhering to Zustand's StateCreator type.
// const log =
//   <TState extends State, TStateCreator extends StateCreator<TState>>(
//     config: TStateCreator,
//   ): StateCreator<TState> =>
//   (set, get, api) =>
//     config(
//       (...args: Parameters<typeof set>) => {
//         console.log("log", args);
//         set(...args);
//       },
//       get,
//       api,
//     );
