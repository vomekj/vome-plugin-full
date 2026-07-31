/** 从 Admin 宿主同步 CSS 变量与 dark 类到无界子应用 document */

export type HostThemeSnapshot = {
	dark?: boolean
	themeId?: string
	tokens?: Record<string, string>
}

const THEME_EVENT = 'vome-host-theme'

const THEME_VARS = [
	'--brand',
	'--brand-soft',
	'--brand-deep',
	'--background',
	'--foreground',
	'--card',
	'--card-foreground',
	'--popover',
	'--popover-foreground',
	'--primary',
	'--primary-foreground',
	'--secondary',
	'--secondary-foreground',
	'--muted',
	'--muted-foreground',
	'--accent',
	'--accent-foreground',
	'--destructive',
	'--danger',
	'--danger-soft',
	'--warning',
	'--warning-soft',
	'--success',
	'--success-soft',
	'--border',
	'--input',
	'--ring',
	'--focus-border',
] as const

type WujieBridge = {
	props?: { theme?: HostThemeSnapshot }
	bus?: {
		$on: (event: string, fn: (payload: HostThemeSnapshot) => void) => void
		$off: (event: string, fn: (payload: HostThemeSnapshot) => void) => void
	}
}

function wujie(): WujieBridge | undefined {
	return (window as Window & { $wujie?: WujieBridge }).$wujie
}

function hostRoot(): HTMLElement | null {
	try {
		return window.parent?.document?.documentElement ?? null
	} catch {
		return null
	}
}

function clearChromeBackground(): void {
	document.documentElement.style.background = 'transparent'
	document.body.style.background = 'transparent'
}

function readHostSnapshot(host: HTMLElement): HostThemeSnapshot {
	const cs = getComputedStyle(host)
	const tokens: Record<string, string> = {}
	for (const key of THEME_VARS) {
		const v = cs.getPropertyValue(key).trim()
		if (v) tokens[key] = v
	}
	return {
		dark: host.classList.contains('dark'),
		themeId: host.dataset.theme,
		tokens,
	}
}

/** 应用主题快照（props / bus / 宿主实时） */
export function applyHostTheme(theme?: HostThemeSnapshot | null): void {
	if (!theme?.tokens || !Object.keys(theme.tokens).length) return
	const self = document.documentElement
	for (const key of THEME_VARS) {
		const value = theme.tokens[key]
		if (value) self.style.setProperty(key, value)
	}
	if (theme.dark != null) {
		self.classList.toggle('dark', Boolean(theme.dark))
	}
	if (theme.themeId) {
		self.dataset.theme = theme.themeId
	}
	clearChromeBackground()
}

/**
 * 同步主题：**优先读宿主实时 document**（切换后 props 可能仍是旧快照）。
 * 仅跨域读不到 parent 时才用 props。
 */
export function syncHostTheme(): void {
	const host = hostRoot()
	if (host) {
		applyHostTheme(readHostSnapshot(host))
		return
	}

	const fromProps = wujie()?.props?.theme
	if (fromProps?.tokens) {
		applyHostTheme(fromProps)
		return
	}
	clearChromeBackground()
}

/** 监听宿主主题：bus（切换瞬间）+ MutationObserver（class/style 落地后） */
export function watchHostTheme(): () => void {
	syncHostTheme()

	const bridge = wujie()
	const onBus = (payload: HostThemeSnapshot) => {
		applyHostTheme(payload)
		// bus / VT 时序：再跟宿主实时值对齐几次
		requestAnimationFrame(() => syncHostTheme())
		window.setTimeout(() => syncHostTheme(), 50)
		window.setTimeout(() => syncHostTheme(), 320)
	}
	bridge?.bus?.$on(THEME_EVENT, onBus)

	const host = hostRoot()
	let mo: MutationObserver | undefined
	if (host) {
		mo = new MutationObserver(() => syncHostTheme())
		mo.observe(host, {
			attributes: true,
			attributeFilter: ['class', 'style', 'data-theme'],
		})
	}

	return () => {
		bridge?.bus?.$off(THEME_EVENT, onBus)
		mo?.disconnect()
	}
}
