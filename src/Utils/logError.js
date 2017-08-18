import global from '../global';
import noop from './noop';

var map = Array.prototype.map;

/**
 * @typesign (...msg);
 */
export default function logError() {
	var console = global.console;

	(console && console.error || noop).call(console || global, map.call(arguments, function(arg) {
		return arg === Object(arg) && arg.stack || arg;
	}).join(' '));
}
