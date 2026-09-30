import type { PiniaPluginContext } from 'pinia'
import type { StorageLike } from 'pinia-plugin-persistedstate'

/**
 * Controls whether stores are saved to localStorage ("Remember my work" in
 * Settings). All persisted stores go through `storage` below, under keys
 * prefixed with `aiverse:`, so turning persistence off can wipe everything.
 */

const PREFIX = 'aiverse:'
// The one thing always kept: the user's choice, so it survives a reload.
const FLAG_KEY = `${PREFIX}remember`

// Keys used before the prefix was added. Removed on load so nothing lingers.
const LEGACY_KEYS = [
  'auth',
  'settings',
  'summarise',
  'write',
  'explain',
  'rewrite',
  'tone',
  'key-points',
  'reply',
  'headlines',
  'words',
]

// localStorage can be missing or throw (private windows, blocked site data).
function local(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function attempt<T>(fn: () => T, fallback: T): T {
  try {
    return fn()
  } catch {
    return fallback
  }
}

let enabled = attempt(() => local()?.getItem(FLAG_KEY) !== 'off', true)

attempt(() => LEGACY_KEYS.forEach((key) => local()?.removeItem(key)), undefined)

/** Global storage for pinia-plugin-persistedstate: a no-op while disabled. */
export const storage: StorageLike = {
  getItem: (key) => (enabled ? attempt(() => local()?.getItem(key) ?? null, null) : null),
  setItem: (key, value) => {
    if (enabled) attempt(() => local()?.setItem(key, value), undefined)
  },
}

export const storageKey = (storeId: string) => `${PREFIX}${storeId}`

// Every store created so far, so re-enabling can save their current state.
const stores = new Set<{ $persist: () => void }>()

/** Pinia plugin that tracks stores for `setPersistence(true)`. */
export function trackStores({ store }: PiniaPluginContext) {
  stores.add(store)
}

export function isPersistenceEnabled(): boolean {
  return enabled
}

/**
 * Turn saving on or off. Off wipes everything AIverse has saved in this
 * browser (inputs, settings and the access token); what's on screen stays
 * until the tab is closed or reloaded. On saves the current state straight away.
 */
export function setPersistence(on: boolean) {
  enabled = on
  const ls = local()
  if (!ls) return

  attempt(() => {
    if (on) {
      ls.removeItem(FLAG_KEY)
      stores.forEach((store) => store.$persist())
      return
    }

    const keys = Array.from({ length: ls.length }, (_, i) => ls.key(i)).filter(
      (key): key is string => !!key && key.startsWith(PREFIX),
    )
    keys.forEach((key) => ls.removeItem(key))
    ls.setItem(FLAG_KEY, 'off')
  }, undefined)
}
