declare namespace Cellx {
	interface IComparator<T> {
		(a: T, b: T): number;
	}

	interface IEvent<T extends EventEmitter = EventEmitter> {
		target: T;
		type: string;
		bubbles?: boolean;
		isPropagationStopped?: boolean;
		data: {
			[name: string]: any;
		};
	}

	type TListener = (evt: IEvent) => boolean | void;

	interface IRegisteredEvent {
		listener: TListener;
		context: any;
	}

	export class EventEmitter {
		static currentlySubscribing: boolean;

		protected _events: Map<string, IRegisteredEvent | Array<IRegisteredEvent>>;

		getEvents(): { [type: string]: Array<IRegisteredEvent> };
		getEvents(type: string): Array<IRegisteredEvent>;

		on(type: string, listener: TListener, context?: any): this;
		on(listeners: { [type: string]: TListener }, context?: any): this;

		off(type: string, listener: TListener, context?: any): this;
		off(listeners?: { [type: string]: TListener }, context?: any): this;

		protected _on(type: string, listener: TListener, context: any): void;
		protected _off(type: string, listener: TListener, context: any): void;

		once(type: string, listener: TListener, context?: any): TListener;

		emit<T extends EventEmitter = EventEmitter>(evt: {
			target?: T;
			type: string;
			bubbles?: boolean;
			isPropagationStopped?: boolean;
			data?: {
				[name: string]: any;
			};
		} | string): IEvent<T>;

		protected _handleEvent(evt: IEvent): void;
	}

	type ObservableMapEntries<K, V> = Array<[K, V]> | { [key: string]: V } | Map<K, V> | ObservableMap<K, V>;

	interface IObservableMapOptions {
		adoptsValueChanges?: boolean;
	}

	export class ObservableMap<K = any, V = any> extends EventEmitter {
		readonly size: number;
		readonly adoptsValueChanges: boolean;
		readonly isFrozen: boolean;

		constructor(entries?: ObservableMapEntries<K, V> | null, opts?: IObservableMapOptions);
		constructor(entries?: ObservableMapEntries<K, V> | null, adoptsValueChanges?: boolean);

		freeze(): this;
		unfreeze(): this;

		has(key: K): boolean;
		contains(value: V): boolean;
		get(key: K): V | undefined;
		set(key: K, value: V): this;
		delete(key: K): boolean;
		clear(): this;

		forEach(callback: (value: V, key: K, map: ObservableMap<K, V>) => void, context?: any): void;
		keys(): Iterator<K>;
		values(): Iterator<V>;
		entries(): Iterator<[K, V]>;

		clone(): this;
	}

	type ObservableListItems<T> = Array<T> | ObservableList<T>;

	interface IObservableListOptions<T> {
		adoptsValueChanges?: boolean;
		comparator?: IComparator<T>;
		sorted?: boolean;
	}

	export class ObservableList<T = any> extends EventEmitter {
		readonly length: number;
		readonly adoptsValueChanges: boolean;
		readonly comparator: IComparator<T>;
		readonly sorted: boolean;
		readonly isFrozen: boolean;

		constructor(items?: ObservableListItems<T> | null, opts?: IObservableListOptions<T>);
		constructor(items?: ObservableListItems<T> | null, adoptsValueChanges?: boolean);

		freeze(): this;
		unfreeze(): this;

		contains(value: T): boolean;
		indexOf(value: T, fromIndex?: number): number;
		lastIndexOf(value: T, fromIndex?: number): number;

		get(index: number): T | undefined;
		getRange(index: number, count?: number): Array<T>;
		set(index: number, value: T): this;
		setRange(index: number, values: Array<T> | ObservableList<T>): this;
		add(value: T): this;
		addRange(values: Array<T> | ObservableList<T>): this;
		protected _addRange(values: Array<T> | ObservableList<T>): void;
		insert(index: number, value: T): this;
		insertRange(index: number, values: Array<T> | ObservableList<T>): this;
		remove(value: T, fromIndex?: number): boolean;
		removeAll(value: T, fromIndex?: number): boolean;
		removeEach(values: Array<T> | ObservableList<T>, fromIndex?: number): boolean;
		removeAllEach(values: Array<T> | ObservableList<T>, fromIndex?: number): boolean;
		removeAt(index: number): T;
		removeRange(index: number, count?: number): Array<T>;
		clear(): this;

		join(separator?: string): string;

		forEach(callback: (item: T, index: number, list: ObservableList<T>) => void, context?: any): void;
		map<R>(callback: (item: T, index: number, list: ObservableList<T>) => R, context?: any): Array<R>;
		filter<R extends T>(
			callback: (item: T, index: number, list: ObservableList<T>) => item is R,
			context?: any
		): Array<R>;
		filter(callback: (item: T, index: number, list: ObservableList<T>) => any, context?: any): Array<T>;
		find(callback: (item: T, index: number, list: ObservableList<T>) => any, context?: any): T | undefined;
		findIndex(callback: (item: T, index: number, list: ObservableList<T>) => any, context?: any): number;
		every(callback: (item: T, index: number, list: ObservableList<T>) => any, context?: any): boolean;
		some(callback: (item: T, index: number, list: ObservableList<T>) => any, context?: any): boolean;
		reduce(
			callback: (accumulator: T, item: T, index: number, list: ObservableList<T>) => T,
			initialValue?: T
		): T;
		reduce<R>(
			callback: (accumulator: R, item: T, index: number, list: ObservableList<T>) => R,
			initialValue?: R
		): R;
		reduceRight(
			callback: (accumulator: T, item: T, index: number, list: ObservableList<T>) => T,
			initialValue?: T
		): T;
		reduceRight<R>(
			callback: (accumulator: R, item: T, index: number, list: ObservableList<T>) => R,
			initialValue?: R
		): R;

		clone(): this;

		toArray(): Array<T>;
		toString(): string;
	}

	interface ICellPull<T> {
		(cell: Cell<T>, next: any): any;
	}

	interface ICellOptions<T> {
		debugKey?: string;
		context?: object;
		owner?: object; // deprecated
		get?: (value: any) => T;
		validate?: (value: T, oldValue: any) => void;
		merge?: (value: T, oldValue: any) => any;
		put?: (cell: Cell<T>, value: any, oldValue: any) => void;
		reap?: () => void;
		onChange?: TListener;
		onError?: TListener;
	}

	interface ICellChangeEvent extends IEvent<Cell> {
		type: 'change';
		data: {
			oldValue: any;
			value: any;
			prev: ICellChangeEvent;
		};
	}

	interface ICellErrorEvent extends IEvent<Cell> {
		type: 'error';
		data: {
			error: any;
		};
	}

	type ICellEvent = ICellChangeEvent | ICellErrorEvent;

	export class Cell<T = any> extends EventEmitter {
		static configure(config: { asynchronous?: boolean }): void;
		static readonly currentlyPulling: boolean;
		static autorun(callback: () => void, context?: any): () => void;
		static forceRelease(): void;
		static transaction(callback: () => void): void;
		static afterRelease(callback: () => void): void;

		readonly debugKey: string;

		readonly context: object;

		constructor(value?: T, opts?: ICellOptions<T>);
		constructor(pull: ICellPull<T>, opts?: ICellOptions<T>);

		addChangeListener(listener: TListener, context?: any): this;
		removeChangeListener(listener: TListener, context?: any): this;
		addErrorListener(listener: TListener, context?: any): this;
		removeErrorListener(listener: TListener, context?: any): this;
		subscribe(listener: (err: Error | void, evt: ICellEvent) => boolean | void, context?: any): this;
		unsubscribe(listener: (err: Error | void, evt: ICellEvent) => boolean | void, context?: any): this;

		get(): T;
		pull(): boolean;
		getError(): Error;
		isPending(): boolean;
		set(value: T): this;
		push(value: any): this;
		fail(err: any): this;

		reap(): this;
		dispose(): this;
	}

	export function autorun(callback: () => void, context?: any): () => void;

	export function transact(callback: () => void): void;
	export function transaction(callback: () => void): void;

	export let KEY_CELL_MAP: symbol;

	export function map<K = any, V = any>(
		entries?: ObservableMapEntries<K, V> | null,
		opts?: IObservableMapOptions
	): ObservableMap<K, V>;
	export function map<K = any, V = any>(
		entries?: ObservableMapEntries<K, V> | null,
		adoptsValueChanges?: boolean
	): ObservableMap<K, V>;

	export function list<T = any>(
		items?: ObservableListItems<T> | null,
		opts?: IObservableListOptions<T>
	): ObservableList<T>;
	export function list<T = any>(
		items?: ObservableListItems<T> | null,
		adoptsValueChanges?: boolean
	): ObservableList<T>;

	export function defineObservableProperty(obj: EventEmitter, name: string, value: any): EventEmitter;
	export function defineObservableProperties(obj: EventEmitter, props: { [name: string]: any }): EventEmitter;
	export function define(obj: EventEmitter, name: string, value: any): EventEmitter;
	export function define(obj: EventEmitter, props: { [name: string]: any }): EventEmitter;

	interface ICellx<T> {
		(value?: T): T;

		(method: 'bind', zeroArg: any): ICellx<T>;
		(method: 'unwrap', zeroArg: any): Cell<T>;

		(method: 'addChangeListener', listener: TListener, context?: any): Cell<T>;
		(method: 'removeChangeListener', listener: TListener, context?: any): Cell<T>;
		(method: 'addErrorListener', listener: TListener, context?: any): Cell<T>;
		(method: 'removeErrorListener', listener: TListener, context?: any): Cell<T>;
		(method: 'subscribe', listener: (err: Error | void, evt: ICellEvent) => boolean | void, context?: any): Cell<T>;
		(method: 'unsubscribe', listener: (err: Error | void, evt: ICellEvent) => boolean | void, context?: any):
			Cell<T>;

		(method: 'pull', zeroArg: any): boolean;
		(method: 'getError', zeroArg: any): Error;
		(method: 'push', value: any): Cell<T>;
		(method: 'fail', err: any): Cell<T>;

		(method: 'isPending', zeroArg: any): boolean;
		(method: 'then', onFulfilled: (value: T) => any, onRejected?: (err: any) => any): Promise<any>;
		(method: 'catch', onRejected: (err: any) => any): Promise<any>;
		(method: 'dispose', zeroArg: any): Cell<T>;
	}

	export function cellx<T = any>(value?: T, opts?: ICellOptions<T>): ICellx<T>;
	export function cellx<T = any>(pull: ICellPull<T>, opts?: ICellOptions<T>): ICellx<T>;
}

declare function Cellx<T = any>(value?: T, opts?: Cellx.ICellOptions<T>): Cellx.ICellx<T>;
declare function Cellx<T = any>(pull: Cellx.ICellPull<T>, opts?: Cellx.ICellOptions<T>): Cellx.ICellx<T>;

export = Cellx;
