/** Browser half: DSH-native theme layer, settings row, and character overlay. */

import { useEffect, useRef, useState } from 'react'
import { defineStore } from '@deepseek-ai/dsh-client-runtime/client'
import manifest from '../../../../skins/blue-whale-navigator/skin.json'
import {
  CHARACTER_STATE_OPTIONS,
  DEFAULT_SKIN_SETTINGS,
  PLUGIN_ID,
  SETTINGS_ROUTE,
  resolveCharacterAssetUrl,
  toDshThemeOverrides,
} from '../shared.js'

const STATE_LABELS = Object.freeze({
  auto: '自动',
  idle: '待机',
  thinking: '思考',
  tool: '调用工具',
  success: '完成',
  error: '错误',
})

const THEME_OVERRIDES = Object.freeze(toDshThemeOverrides(manifest))

function createSkinStore() {
  return defineStore({
    init: () => ({ ...DEFAULT_SKIN_SETTINGS, syncRevision: -1 }),
    actions: {
      sync: (draft, settings, revision) => {
        if (revision <= draft.syncRevision) return
        Object.assign(draft, settings)
        draft.syncRevision = revision
      },
    },
  })
}

function useAutomaticState(running) {
  const previousRunning = useRef(running)
  const [state, setState] = useState(running ? 'thinking' : 'idle')
  useEffect(() => {
    let timeout
    if (running) {
      setState('thinking')
    } else if (previousRunning.current) {
      setState('success')
      timeout = window.setTimeout(() => { setState('idle') }, 1600)
    } else {
      setState('idle')
    }
    previousRunning.current = running
    return () => {
      if (timeout !== undefined) window.clearTimeout(timeout)
    }
  }, [running])
  return state
}

function CharacterOverlay({ useSessions, useStore }) {
  const settings = useStore(state => state)
  const running = useSessions((sessions) => {
    const current = sessions.current
    return current === undefined ? false : sessions.byId[current]?.running === true
  })
  const automaticState = useAutomaticState(running)
  if (!settings.enabled || !settings.characterVisible) return null
  const characterState = settings.characterState === 'auto'
    ? automaticState
    : settings.characterState
  const src = resolveCharacterAssetUrl(manifest, characterState)
  if (src === undefined) return null
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      data-dsh-skin-character=""
      data-dsh-skin-character-state={characterState}
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        zIndex: 40,
        width: 'min(28vw, 360px)',
        height: 'auto',
        maxHeight: '60vh',
        objectFit: 'contain',
        pointerEvents: 'none',
        filter: 'drop-shadow(0 18px 32px rgba(3, 19, 31, 0.2))',
      }}
    />
  )
}

const rowStyle = {
  borderBottom: '1px solid var(--dsw-alias-border-l2)',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
  padding: '16px 0',
  color: 'var(--dsw-alias-label-primary)',
}

const buttonStyle = {
  border: '1px solid var(--dsw-alias-border-l2)',
  borderRadius: 10,
  background: 'var(--dsw-alias-bg-layer-2)',
  color: 'var(--dsw-alias-label-primary)',
  cursor: 'pointer',
  padding: '7px 10px',
}

function SkinSettingsRow({ setCharacterState, setCharacterVisible, setEnabled, useStore }) {
  const settings = useStore(state => state)
  return (
    <div style={rowStyle} data-dsh-skins-settings-row="">
      <div style={{ fontSize: 14 }}>DshSkin</div>
      <div style={{ color: 'var(--dsw-alias-label-secondary)', fontSize: 12 }}>
        已安装：蓝鲸航员（声明式皮肤包）
      </div>
      <label style={{ alignItems: 'center', display: 'flex', gap: 8, fontSize: 13 }}>
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(event) => { setEnabled(event.currentTarget.checked) }}
        />
        启用皮肤配色
      </label>
      <label style={{ alignItems: 'center', display: 'flex', gap: 8, fontSize: 13 }}>
        <input
          type="checkbox"
          checked={settings.characterVisible}
          onChange={(event) => { setCharacterVisible(event.currentTarget.checked) }}
        />
        显示角色装饰
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {CHARACTER_STATE_OPTIONS.map(state => (
          <button
            key={state}
            type="button"
            aria-pressed={settings.characterState === state}
            onClick={() => { setCharacterState(state) }}
            style={{
              ...buttonStyle,
              borderColor: settings.characterState === state
                ? 'var(--dsw-alias-brand-primary)'
                : 'var(--dsw-alias-border-l2)',
            }}
          >
            {STATE_LABELS[state]}
          </button>
        ))}
      </div>
      <div style={{ color: 'var(--dsw-alias-label-secondary)', fontSize: 12 }}>
        自动模式当前映射运行与完成状态；工具和错误按钮用于第一阶段兼容性验证。
      </div>
    </div>
  )
}

/** Required DSH browser services; slot declarations may arrive after this plugin. */
export const inject = ['slots', 'theme']

/** Install the reversible theme layer and two additive DSH UI contributions. */
export function apply(ctx) {
  const store = createSkinStore()
  let boundActions
  let syncRevision = 0
  let localSettings = { ...DEFAULT_SKIN_SETTINGS }
  let appliedTheme = false
  let disposeTheme
  let writeGeneration = 0
  let writeTail = Promise.resolve()

  const reconcileTheme = () => {
    const enabled = localSettings.enabled
    if (enabled === appliedTheme) return
    disposeTheme?.()
    disposeTheme = undefined
    appliedTheme = enabled
    if (enabled) disposeTheme = ctx.theme.overrideTokens(PLUGIN_ID, THEME_OVERRIDES)
  }
  const sync = (settings) => {
    localSettings = { ...DEFAULT_SKIN_SETTINGS, ...settings }
    boundActions?.sync(localSettings, syncRevision++)
    reconcileTheme()
  }
  const load = async (signal) => {
    const response = await fetch(SETTINGS_ROUTE, { signal })
    if (!response.ok) throw new Error(`settings load failed: HTTP ${response.status}`)
    return response.json()
  }
  const write = (field, value) => {
    sync({ ...localSettings, [field]: value })
    const generation = ++writeGeneration
    writeTail = writeTail.then(async () => {
      const response = await fetch(SETTINGS_ROUTE, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ field, value }),
      })
      if (!response.ok) throw new Error(`settings write failed: HTTP ${response.status}`)
      const confirmed = await response.json()
      if (generation === writeGeneration) sync(confirmed)
    }).catch(async (error) => {
      if (generation !== writeGeneration) return
      console.error(`[dsh-skins] failed to persist ${field}`, error)
      try {
        sync(await load())
      } catch (reloadError) {
        console.error('[dsh-skins] failed to recover settings', reloadError)
      }
    })
  }

  ctx.effect(() => {
    const abort = new AbortController()
    sync(localSettings)
    reconcileTheme()
    void load(abort.signal).then(sync).catch((error) => {
      if (error?.name !== 'AbortError') console.error('[dsh-skins] failed to load settings', error)
    })
    return () => {
      abort.abort()
      disposeTheme?.()
      disposeTheme = undefined
      appliedTheme = false
    }
  }, 'dsh-skins: settings and theme layer')

  const bindStore = (actions) => {
    boundActions = actions
    sync(localSettings)
  }

  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'dsh-skins-character',
    order: 100,
    store,
    inject: (actions) => {
      bindStore(actions)
      return {}
    },
  }, CharacterOverlay))

  ctx.slots.inject('settings.general.item', () => ctx.slots.register({
    name: 'settings.general.item',
    id: 'dsh-skins',
    order: 20,
    store,
    inject: (actions) => {
      bindStore(actions)
      return {
        setEnabled: value => { write('enabled', value) },
        setCharacterVisible: value => { write('characterVisible', value) },
        setCharacterState: value => { write('characterState', value) },
      }
    },
  }, SkinSettingsRow))
}
