/**
 * An object that can carry registered hooks.
 */
export type HookTarget = object & {
    _vanillapod_hooks?: ElementHooks;
};
/**
 * registerHook
 *
 * @param {HookTarget} element - element with registered hooks
 * @param {string} hook - hook name
 * @returns {void}
 */
export function registerHook(element: HookTarget, hook: string): void;
/**
 * registerHooks
 *
 * @param {HookTarget} element - element to register hooks on
 * @param {{ hooks?: ElementHooks }} props - uses `hooks`
 * @returns {void}
 */
export function registerHooks(element: HookTarget, { hooks }: {
    hooks?: ElementHooks;
}): void;
/**
 * triggerHook
 *
 * @param {HookTarget} element - element with registered hooks
 * @param {string} hookName - name of hook to trigger
 * @param {...unknown} args - arguments passed to the hook
 * @returns {void}
 */
export function triggerHook(element: HookTarget, hookName: string, ...args: unknown[]): void;
import type { ElementHooks } from "./element.js";
