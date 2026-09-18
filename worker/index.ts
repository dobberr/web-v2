function json(data: unknown, init: ResponseInit = {}) {
	return Response.json(data, {
		...init,
		headers: {
			"Cache-Control": "no-store",
			...(init.headers ?? {}),
		},
	});
}

function wispTarget(request: Request, configuredUrl: string) {
	const configured = new URL(configuredUrl);
	const incoming = new URL(request.url);
	configured.pathname = `${configured.pathname.replace(/\/$/, "")}${incoming.pathname.replace(/^\/wisp/, "") || "/"}`;
	configured.search = incoming.search;
	return configured;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === "/health") {
			return json({ ok: true, service: "magma-webos" });
		}

		if (url.pathname === "/api/config") {
			return json({
				wispServer: env.WISP_URL || null,
				authBaseUrl: env.AUTH_BASE_URL || null,
			});
		}

		if (url.pathname.startsWith("/api/")) {
			return json({ error: "API route not found." }, { status: 404 });
		}

		if (url.pathname.startsWith("/wisp")) {
			if (!env.WISP_URL) {
				return json({ error: "Wisp is not configured for this deployment." }, { status: 503 });
			}
			if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") {
				return json({ error: "The Wisp endpoint requires a WebSocket upgrade." }, { status: 426 });
			}
			try {
				const upstream = await fetch(new Request(wispTarget(request, env.WISP_URL), request));
				return upstream;
			} catch (error) {
				console.error("Wisp bridge failed", error);
				return json({ error: "Unable to connect to the configured Wisp service." }, { status: 502 });
			}
		}

		return env.ASSETS.fetch(request);
	},
} satisfies ExportedHandler<Env>;
