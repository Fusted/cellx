import { Cell, ICellOptions, TCellEvent, TCellPull } from './Cell';
import { IObservableListOptions, ObservableList, TObservableListItems } from './collections/ObservableList';
import { IObservableMapOptions, ObservableMap, TObservableMapEntries } from './collections/ObservableMap';
import { EventEmitter, TListener } from './EventEmitter';
export { IEvent, TListener, IRegisteredEvent, EventEmitter } from './EventEmitter';
export { FreezableCollection } from './collections/FreezableCollection';
export { ObservableCollection } from './collections/ObservableCollection';
export { TObservableMapEntries, IObservableMapOptions, ObservableMap } from './collections/ObservableMap';
export { TComparator, TObservableListItems, IObservableListOptions, ObservableList } from './collections/ObservableList';
export { TCellPull, ICellOptions, ICellChangeEvent, ICellErrorEvent, TCellEvent, Cell } from './Cell';
export { KEY_CELL_MAP } from './keys';
export declare function map<K = any, V = any>(entries?: TObservableMapEntries<K, V> | null, opts?: IObservableMapOptions | boolean): ObservableMap<K, V>;
export declare function list<T = any>(items?: TObservableListItems<T> | null, opts?: IObservableListOptions<T> | boolean): ObservableList<T>;
export interface ICellx<T> {
    (value?: T): T;
    (method: 'bind', $: any): ICellx<T>;
    (method: 'unwrap', $: any): Cell<T>;
    (method: 'addChangeListener', listener: TListener, context?: any): Cell<T>;
    (method: 'removeChangeListener', listener: TListener, context?: any): Cell<T>;
    (method: 'addErrorListener', listener: TListener, context?: any): Cell<T>;
    (method: 'removeErrorListener', listener: TListener, context?: any): Cell<T>;
    (method: 'subscribe', listener: (err: Error | void, evt: TCellEvent) => boolean | void, context?: any): Cell<T>;
    (method: 'unsubscribe', listener: (err: Error | void, evt: TCellEvent) => boolean | void, context?: any): Cell<T>;
    (method: 'pull', $: any): boolean;
    (method: 'getError', $: any): Error;
    (method: 'push', value: any): Cell<T>;
    (method: 'fail', err: any): Cell<T>;
    (method: 'isPending', $: any): boolean;
    (method: 'then', onFulfilled: (value: T) => any, onRejected?: (err: any) => any): Promise<any>;
    (method: 'catch', onRejected: (err: any) => any): Promise<any>;
    (method: 'reap', $: any): Cell<T>;
    (method: 'dispose', $: any): Cell<T>;
}
export declare function cellx<T = any>(value: T, opts?: ICellOptions<T>): ICellx<T>;
export declare function cellx<T = any>(pull: TCellPull<T>, opts?: ICellOptions<T>): ICellx<T>;
export declare function defineObservableProperty<T extends EventEmitter = EventEmitter>(obj: T, name: string, value: any): T;
export declare function defineObservableProperties<T extends EventEmitter = EventEmitter>(obj: T, props: {
    [name: string]: string;
}): T;
export declare function define<T extends EventEmitter = EventEmitter>(obj: T, name: string, value: any): T;
export declare function define<T extends EventEmitter = EventEmitter>(obj: T, props: {
    [name: string]: any;
}): T;
