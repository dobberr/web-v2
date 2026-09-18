export interface RuntimeConfig {
	wispServer: string | null;
	authBaseUrl: string | null;
}

const configKey = "magma-runtime-config";

export function sameOriginWisp() {
	return `${location.protocol.replace("http", "ws")}//${location.host}/wisp/`;
}

export function getRuntimeConfig(): RuntimeConfig {
	try {
		return JSON.parse(sessionStorage.getItem(configKey) || "null") || { wispServer: null, authBaseUrl: null };
	} catch {
		return { wispServer: null, authBaseUrl: null };
	}
}

export async function loadRuntimeConfig() {
	try {
		const response = await fetch("/api/config", { headers: { Accept: "application/json" } });
		if (!response.ok) return getRuntimeConfig();
		const config = (await response.json()) as Partial<RuntimeConfig>;
		const next: RuntimeConfig = {
			wispServer: config.wispServer || null,
			authBaseUrl: config.authBaseUrl || null,
		};
		sessionStorage.setItem(configKey, JSON.stringify(next));
		return next;
	} catch {
		return getRuntimeConfig();
	}
}

export function configuredWisp() {
	return getRuntimeConfig().wispServer || sameOriginWisp();
}

export function configuredAuthBaseUrl() {
	return getRuntimeConfig().authBaseUrl || window.location.origin;
}
