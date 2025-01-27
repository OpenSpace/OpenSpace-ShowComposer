import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { createPageSlice, PageSlice } from './pageSlice';
import { createLayoutSlice, LayoutSlice } from './layoutSlice';
import { createPositionSlice, PositionSlice } from './positionSlice';
import { createComponentSlice, ComponentSlice } from './componentSlice'; // Assuming you have a componentSlice
// import { debounce, isEmpty } from 'lodash';
import { temporal } from 'zundo';
// import { isEmpty, throttle } from 'lodash';
// import diff from 'microdiff';
import debounce from 'just-debounce-it';
// import isDeepEqual from 'fast-deep-equal';
// import { isEmpty } from 'lodash';
// Define the combined state type
type BoundStoreState = PageSlice & LayoutSlice & PositionSlice & ComponentSlice;

export const useBoundStore = create<BoundStoreState>()(
  devtools(
    persist(
      immer(
        temporal(
          (...a) => ({
            ...createPageSlice(...a),
            ...createLayoutSlice(...a),
            ...createPositionSlice(...a),
            ...createComponentSlice(...a),
          }),
          {
            limit: 20,
            partialize: (state) => {
              const {
                debouncePositions,
                endSaveCount,
                startSaveCount,
                selectedComponents,
                addComponent,
                addComponentToLayout,
                addComponentToPageById,
                addLayout,
                handleLayoutDrop,
                handleComponentDrop,
                addPages,
                addComponents,
                addPositions,
                addLayouts,
                ...rest
              } = state;

              return rest;
            },

            handleSet: (handleSet) => {
              //   let accumulatedState: Partial<BoundStoreState> = {};
              let firstState: Partial<BoundStoreState> | null = null; // To store the first state
              const myDebouncedFunction = debounce<typeof handleSet>(
                (_s) => {
                  if (firstState) {
                    handleSet(firstState);
                  }

                  firstState = null; // Reset fir
                },
                500, // Debounce time
                // true,
              );

              const myCustomSetter: typeof handleSet = (state) => {
                if (!state) return;

                // console.log('state', state);
                // Merge incoming state with accumulated state
                if (firstState === null) {
                  firstState = { ...state };
                  //   handleSet(firstState);
                }
                // accumulatedState = { ...accumulatedState, ...state };
                myDebouncedFunction(state);
                // if (firstState && !lastState) {
                //   handleSet(firstState);
                //   firstState = null;
                // }
              };
              return myCustomSetter;
            },
            // equality: isDeepEqual,
            onSave: (state) => console.log('saved', state),
            // diff: (pastState, currentState) => {
            //   const myDiff = diff(currentState, pastState);

            //   const getNestedValue = (obj: any, path: string[]) => {
            //     return path.reduce((acc, key) => acc && acc[key], obj);
            //   };

            //   const newStateFromDiff = myDiff.reduce(
            //     (acc, difference) => {
            //       if (difference.type === 'CHANGE') {
            //         // Access the value using the path array directly
            //         const value = getNestedValue(currentState, difference.path);

            //         // Traverse the accumulator to set the value at the correct nested path
            //         let nestedAcc = acc;
            //         for (let i = 0; i < difference.path.length - 1; i++) {
            //           const key = difference.path[i];
            //           if (!nestedAcc[key]) {
            //             nestedAcc[key] = {}; // Create an object if it doesn't exist
            //           }
            //           nestedAcc = nestedAcc[key]; // Move deeper into the nested structure
            //         }
            //         nestedAcc[difference.path[difference.path.length - 1]] =
            //           value; // Set the value at the final key
            //       }
            //       return acc;
            //     },
            //     {} as Partial<typeof currentState>,
            //   );

            //   console.log('newStateFromDiff', newStateFromDiff);
            //   return isEmpty(newStateFromDiff) ? null : newStateFromDiff;
            // },
          },
        ),
      ),
      { name: 'bound-store' }, // Name for the persisted store
    ),
    { name: 'bound-store' }, // Name for the devtools
  ),
);

import { useStoreWithEqualityFn } from 'zustand/traditional';
import type { TemporalState } from 'zundo';

function useTemporalStore(): TemporalState<BoundStoreState>;
function useTemporalStore<T>(
  selector: (state: TemporalState<BoundStoreState>) => T,
): T;
function useTemporalStore<T>(
  selector: (state: TemporalState<BoundStoreState>) => T,
  equality: (a: T, b: T) => boolean,
): T;

function useTemporalStore<T>(
  selector?: (state: TemporalState<BoundStoreState>) => T,
  equality?: (a: T, b: T) => boolean,
) {
  // @ts-ignore
  return useStoreWithEqualityFn(useBoundStore.temporal, selector!, equality);
}

export const useBoundStoreTemporal = useTemporalStore;
