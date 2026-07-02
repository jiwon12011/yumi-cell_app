import { useCallback, useEffect, useReducer } from 'react';
import { clampName, clampNote, loadStore, saveStore } from '../logic/entriesStore';
import type { CellId, DiaryEntry, Intensity, PoseIndex, StoreV1 } from '../logic/types';

export interface EntryInput {
  date: string;
  cellId: CellId;
  poseIndex: PoseIndex;
  intensity: Intensity;
  note: string;
}

type Action =
  | { type: 'upsert'; input: EntryInput; now: number }
  | { type: 'remove'; date: string }
  | { type: 'onboarded'; name?: string }
  | { type: 'setName'; name: string }
  | { type: 'reset' };

function reducer(store: StoreV1, action: Action): StoreV1 {
  switch (action.type) {
    case 'upsert': {
      const prev = store.entries[action.input.date];
      const entry: DiaryEntry = {
        ...action.input,
        note: clampNote(action.input.note),
        createdAt: prev?.createdAt ?? action.now,
        updatedAt: action.now,
      };
      return { ...store, entries: { ...store.entries, [entry.date]: entry } };
    }
    case 'remove': {
      const entries = { ...store.entries };
      delete entries[action.date];
      return { ...store, entries };
    }
    case 'onboarded':
      return {
        ...store,
        onboarded: true,
        userName: action.name !== undefined ? clampName(action.name) : store.userName,
      };
    case 'setName':
      return { ...store, userName: clampName(action.name) };
    case 'reset':
      return { version: 1, onboarded: true, userName: store.userName, entries: {} };
  }
}

/** entries 단일 진실 원천 + localStorage 영속화 (기획서 §6.2) */
export function useEntries() {
  const [store, dispatch] = useReducer(reducer, undefined, loadStore);

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const upsert = useCallback(
    (input: EntryInput) => dispatch({ type: 'upsert', input, now: Date.now() }),
    [],
  );
  const remove = useCallback((date: string) => dispatch({ type: 'remove', date }), []);
  const markOnboarded = useCallback(
    (name?: string) => dispatch({ type: 'onboarded', name }),
    [],
  );
  const setName = useCallback((name: string) => dispatch({ type: 'setName', name }), []);
  const resetAll = useCallback(() => dispatch({ type: 'reset' }), []);

  return { store, upsert, remove, markOnboarded, setName, resetAll };
}
