export interface RuntimeConfig {
	wispServer: string | null;
	authBaseUrl: string | null;
}

const configKey = "magma-runtime-config";

export function sameOriginWisp() {
	return `${location.protocol.replace("http", "ws")}//${location.host}/wisp/`;
}

export function isSameOriginWisp(value: string | null | undefined) {
	if (!value) return false;
	try {
		const configured = new URL(value);
		return configured.host === location.host && configured.pathname.replace(/\/$/, "") === "/wisp";
	} catch {
		return false;
	}
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

export function resolveWisp(value: string | null | undefined) {
	const configured = getRuntimeConfig().wispServer;
	if (configured && (!value || isSameOriginWisp(value))) return configured;
	return value || configured || sameOriginWisp();
}

export function configuredAuthBaseUrl() {
	return getRuntimeConfig().authBaseUrl || window.location.origin;
}
