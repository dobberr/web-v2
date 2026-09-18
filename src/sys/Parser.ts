import * as htmlparser from "htmlparser2";

var isNative: boolean = false;
var region: HTMLElement | null = null;
var tbWindow: HTMLElement | null = null;
// @ts-expect-error API Stub, Declaration will be read eventually
var appTitle: string | null = null;

const parse = {
	/**
	 * THIS MAY NOT MAKE IT TO PRODUCTION
	 *
	 * Parses the given HTML or TML file and returns a built Magma window
	 * @param src The source code of the file
	 * @returns new Magma window
	 * @example parse.build('<window><region><title>My Window</title></region></window>')
	 * @example parse.build('https://example.com/window.tml')
	 * @function `parse.build`
	 */
	build: async (src: string) => {
		const baseURL = new URL(src, window.location.href).href;
		const response = await window.tb.libcurl.fetch(baseURL);
		if (!response) throw new Error(`Failed to fetch the source from ${src}`);
		const data = await response.text();
		if (data.startsWith(`@native`) || (src.endsWith(".tml") && !data.startsWith("<body/>"))) {
			isNative = true;
		}
		if (!isNative) return;
		console.warn("This functionality is not refined and may not work as expected.");
		tbWindow = document.createElement("window-body");
		const shadow = tbWindow.attachShadow({ mode: "open" });
		const parser: htmlparser.Parser | undefined = new htmlparser.Parser(
			{
				onopentag: (name: string, attribs: { [s: string]: string }) => {
					if (name === "region") {
						region = document.createElement("region");
						for (const key in attribs) {
							region.setAttribute(key, attribs[key]);
						}
					}
					const element = document.createElement(name);
					for (const key in attribs) {
						element.setAttribute(key, attribs[key]);
					}
					shadow.appendChild(element);
				},
			},
			{ decodeEntities: true },
		);
		parser!.write(data);
		parser!.end();

		console.log(tbWindow);
		return tbWindow;
	},
};

export default parse;
