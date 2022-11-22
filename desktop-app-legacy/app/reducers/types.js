import type {Dispatch as ReduxDispatch, Store as ReduxStore} from 'redux';
import type {BrowserStateType as _BrowserStateType} from './browser';

export type BrowserStateType = _BrowserStateType;

export type counterStateType = {
  +counter: number,
};

export type RootStateType = {
  browser: BrowserStateType,
};

export type Action = {
  +type: string,
};

export type GetState = () => RootStateType;

export type Dispatch = ReduxDispatch<Action>;

export type Store = ReduxStore<GetState, Action>;
