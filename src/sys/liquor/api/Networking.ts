export class Networking {
	libcurl: any;
	// @ts-expect-error
	WebSocket: typeof WebSocket;
	Socket: any;
	TLSSocket: any;
	external = {
		fetch: window.fetch,
	};
	constructor() {
		if (window.tb.libcurl) {
			this.libcurl = window.tb.libcurl;
			this.initLibcurl();
		} else {
			console.warn("Anura Networking failed to connect to the TB instance");
		}
	}
	private initLibcurl = async () => {
		try {
			this.WebSocket = this.libcurl.WebSocket;

			// @ts-ignore
			this.external.fetch = (...args) => {
				return this.libcurl.fetch(...args);
			};

			this.Socket = this.libcurl.WispConnection;
			this.TLSSocket = this.libcurl.TLSSocket;
			this.setWispServer(`${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/wisp/`);
			console.log("libcurl.js ready!");
		} catch (error) {
			console.warn("Anura Networking Error:", error);
		}
	};
	loopback = {
		addressMap: new Map(),
		call: async (port: number, request: Request) => {
			return await this.loopback.addressMap.get(port)(request);
		},
		set: async (port: number, handler: () => Response) => {
			this.loopback.addressMap.set(port, handler);
		},
		deregister: async (port: number) => {
			this.loopback.addressMap.delete(port);
		},
	};
	fetch = async (url: any, methods: any) => {
		console.log(this.libcurl.ready);
		let requestObj: Request;
		if (url instanceof Request) {
			requestObj = url;
		} else {
			if (methods) requestObj = new Request(url, methods);
			else requestObj = new Request(url);
		}
		const urlObj = new URL(requestObj.url);
		if (urlObj.hostname === "localhost") {
			const port = Number(urlObj.port) || 80;
			if (this.loopback.addressMap.has(port)) return this.loopback.call(port, requestObj);
			else {
				window.anura.notifications.add({
					title: "Anura Networking Error",
					description: "fetch requested to non binded localhost port",
					timeout: 5000,
				});
				return new Response();
			}
		} else {
			return this.external.fetch(url, methods);
		}
	};
	setWispServer = (wisp_server: string) => {
		this.libcurl.set_websocket(wisp_server);
	};
}
