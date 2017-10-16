import { Map } from '@riim/map-set-polyfill';
import { assign } from '@riim/object-assign-polyfill';
import {
	Cell,
	ICellOptions,
	TCellEvent,
	TCellPull
	} from './Cell';
import { IObservableListOptions, ObservableList, TObservableListItems } from './collections/ObservableList';
import { IObservableMapOptions, ObservableMap, TObservableMapEntries } from './collections/ObservableMap';
import { EventEmitter, TListener } from './EventEmitter';
import { KEY_CELL_MAP } from './keys';

export { IEvent, TListener, IRegisteredEvent, EventEmitter } from './EventEmitter';
export { FreezableCollection } from './collections/FreezableCollection';
export { ObservableCollection } from './collections/ObservableCollection';
export { TObservableMapEntries, IObservableMapOptions, ObservableMap } from './collections/ObservableMap';
export {
	TComparator,
	TObservableListItems,
	IObservableListOptions,
	ObservableList
} from './collections/ObservableList';
export { TCellPull, ICellOptions, ICellChangeEvent, ICellErrorEvent, TCellEvent, Cell } from './Cell';
export { KEY_CELL_MAP } from './keys';

let hasOwn = Object.prototype.hasOwnProperty;
let slice = Array.prototype.slice;

let global = Function('return this;')();

export function map<K = any, V = any>(
	entries?: TObservableMapEntries<K, V> | null,
	opts?: IObservableMapOptions | boolean
): ObservableMap<K, V> {
	return new ObservableMap(entries, opts);
}

export function list<T = any>(
	items?: TObservableListItems<T> | null,
	opts?: IObservableListOptions<T> | boolean
): ObservableList<T> {
	return new ObservableList(items, opts);
}

export interface ICellx<T> {
	(value?: T): T;

	(method: 'bind', $: any): ICellx<T>;
	(method: 'unwrap', $: any): Cell<T>;

	(method: 'addChangeListener', listener: TListener, context?: any): Cell<T>;
	(method: 'removeChangeListener', listener: TListener, context?: any): Cell<T>;
	(method: 'addErrorListener', listener: TListener, context?: any): Cell<T>;
	(method: 'removeErrorListener', listener: TListener, context?: any): Cell<T>;
	(method: 'subscribe', listener: (err: Error | void, evt: TCellEvent) => boolean | void, context?: any): Cell<T>;
	(method: 'unsubscribe', listener: (err: Error | void, evt: TCellEvent) => boolean | void, context?: any):
		Cell<T>;

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

export function cellx<T = any>(value: T, opts?: ICellOptions<T>): ICellx<T>;
export function cellx<T = any>(pull: TCellPull<T>, opts?: ICellOptions<T>): ICellx<T>;
export function cellx(value: any, opts?: ICellOptions<any>) {
	if (!opts) {
		opts = {};
	}

	let initialValue = value;

	let cx = function(value: any) {
		let context = this;

		if (!context || context == global) {
			context = cx;
		}

		if (!hasOwn.call(context, KEY_CELL_MAP)) {
			Object.defineProperty(context, KEY_CELL_MAP, { value: new Map() });
		}

		let cell = context[KEY_CELL_MAP].get(cx);

		if (!cell) {
			if (value === 'dispose' && arguments.length >= 2) {
				return;
			}

			cell = new Cell(initialValue, assign<any, any>({ context }, opts));

			context[KEY_CELL_MAP].set(cx, cell);
		}

		switch (arguments.length) {
			case 0: {
				return cell.get();
			}
			case 1: {
				cell.set(value);
				return value;
			}
			default: {
				let method = value;

				switch (method) {
					case 'bind': {
						cx = cx.bind(context);
						cx.constructor = cellx;
						return cx;
					}
					case 'unwrap': {
						return cell;
					}
					default: {
						let result = (Cell.prototype as any)[method].apply(cell, slice.call(arguments, 1));
						return result === cell ? cx : result;
					}
				}
			}
		}
	};
	cx.constructor = cellx;

	if (opts.onChange || opts.onError) {
		cx.call(opts.context || global);
	}

	return cx;
}

export function defineObservableProperty<T extends EventEmitter = EventEmitter>(obj: T, name: string, value: any): T {
	let cellName = name + 'Cell';

	Object.defineProperty(obj, cellName, {
		configurable: true,
		enumerable: false,
		writable: true,
		value: value instanceof Cell ? value : new Cell(value, { context: obj })
	});

	Object.defineProperty(obj, name, {
		configurable: true,
		enumerable: true,

		get: function() {
			return this[cellName].get();
		},

		set: function(value) {
			this[cellName].set(value);
		}
	});

	return obj;
}

export function defineObservableProperties<T extends EventEmitter = EventEmitter>(
	obj: T,
	props: { [name: string]: string }
): T {
	Object.keys(props).forEach((name) => {
		defineObservableProperty(obj, name, props[name]);
	});

	return obj;
}

export function define<T extends EventEmitter = EventEmitter>(obj: T, name: string, value: any): T;
export function define<T extends EventEmitter = EventEmitter>(obj: T, props: { [name: string]: any }): T;
export function define(obj: EventEmitter, name: string | { [name: string]: any }, value?: any) {
	if (typeof name == 'string') {
		defineObservableProperty(obj, name, value);
	} else {
		defineObservableProperties(obj, name);
	}

	return obj;
}