interface LibURIHandler {
	tag: "lib";
	pkg: string;
	version?: string;
	import: string;
}

type SplitArgMethod = {
	tag: "split";
	separator: RegExp | string;
};

type SingleArgMethod = {
	tag: "single";
};

interface AppURIHandler {
	tag: "app";
	pkg: string;
	method: SplitArgMethod | SingleArgMethod;
}

interface URIHandlerOptions {
	handler: LibURIHandler | AppURIHandler;
	prefix?: string;
}

export class URIHandlerAPI {
	// Handles a URI like "protocol:something/etc" by opening the appropriate app or library.
	async handle(uri: string): Promise<void> {
		// const url = new URL(uri);
		// const protocol = url.protocol.slice(0, -1);
		const [protocol, ...path] = uri.split(":");
		const pathname = path.join(":");
		const handlers = window.anura.settings.get("URIHandlers") || {};
		const handler = handlers[protocol as string];
		if (!handler) {
			throw new Error(`No handler for URI protocol ${protocol}`);
		}
		if (handler.handler.tag === "lib") {
			let lib;
			if (handler.handler.version) {
				lib = await window.anura.import(handler.handler.pkg + "@" + handler.handler.version);
			} else {
				lib = await window.anura.import(handler.handler.pkg);
			}
			await lib[handler.handler.import]((handler.prefix || "") + pathname);
		} else if (handler.handler.tag === "app") {
			const app = handler.handler;
			if (app.method && app.method.tag !== undefined && app.method.tag === "split") {
				const args = pathname.split(app.method.separator);
				await window.anura.apps[app.pkg].open(handler.prefix ? [handler.prefix, ...args] : args);
			} else {
				window.tb.window.create({
					title: "Magma Webview",
					src: handler.prefix,
					size: {
						width: 460,
						height: 460,
						minWidth: 160,
						minHeight: 160,
					},
					icon: "/apps/browser.tapp/icon.svg",
				});
			}
		}
	}

	// Sets a handler for a URI protocol.
	set(protocol: string, options: URIHandlerOptions): void {
		const handlers = window.anura.settings.get("URIHandlers") || {};
		handlers[protocol] = options;
		window.anura.settings.set("URIHandlers", handlers);
	}

	// Removes a handler for a URI protocol.
	remove(protocol: string): void {
		const handlers = window.anura.settings.get("URIHandlers") || {};
		delete handlers[protocol];
		window.anura.settings.set("URIHandlers", handlers);
	}

	// Determines if a handler is set for a URI protocol.
	has(protocol: string): boolean {
		const handlers = window.anura.settings.get("URIHandlers") || {};
		return !!handlers[protocol];
	}
}
