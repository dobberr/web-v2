async function sysfetch(args, term) {
	if (args._raw.includes("-v")) {
		displayOutput("Sysfetch v1.0.0");
		createNewCommandInput();
	} else {
		let accent = "#32ae62";
		let settings = JSON.parse(await window.parent.tb.fs.promises.readFile(`/home/${sessionStorage.getItem("currAcc")}/settings.json`, "utf8"));
		if (settings["accent"]) {
			accent = settings["accent"];
		}
		displayOutput("                                 %cSystem Information", "color: #3cc3f0; font-weight: bold; text-decoration: underline;");
		displayOutput(`%c@@@@@@@@@@@@@@~ B@@@@@@@@#G?.     OS%c: MagmaOS ${tb.system.version()}`, `color: ${accent}`, "color: #b6b6b6");
		displayOutput("%cB###&@@@@&####^ #@@@&PPPB@@@G.    Kernel%c: Ayla v1.0.0", `color: ${accent}`, "color: #b6b6b6");
		displayOutput("%c    ~@@@@J     .#@@@P   ~&@@@^    DE%c: Alexa", `color: ${accent}`, "color: #b6b6b6");
		displayOutput("%c    ^@@@@?     .#@@@@###&@@&7     %c", `color: ${accent}`, "color: #b6b6b6");
		displayOutput("%c    ^@@@@?     .#@@@#555P&@@B7" + "   %cHardware Information (estimated)", `color: ${accent}`, "color: #3cc3f0; font-weight: bold; text-decoration: underline;");
		await displayCPUInfo(accent);
		await displayMemoryInfo(accent);
		await getStorage(accent);
		await displayGPUInfo(accent);
		createNewCommandInput();
	}
}

async function displayCPUInfo(accent) {
	let cpuCors = navigator.hardwareConcurrency;
	let cpuInfo = "%c    ^@@@@?     .#@@@P    G@@@@" + "    %cCPU%c: " + cpuCors + " Logical Cores " + `(${Math.floor(cpuCors / 2)} Cores ${cpuCors} threads)`;
	displayOutput(cpuInfo, `color: ${accent}`, `color: ${accent}`, "color: #b6b6b6");
	return true;
}

async function displayMemoryInfo(accent) {
	let mem = navigator.deviceMemory ? navigator.deviceMemory + "GB" : "Unknown";
	let memoryInfo = "%c    ^@@@@?     .#@@@&GGG#@@@@Y " + "   %cMemory%c: " + mem;
	displayOutput(memoryInfo, `color: ${accent}`, `color: ${accent}`, "color: #b6b6b6");
	return true;
	// Im confused tho cus I dont think memory is causing it but like idk
	// this is like the process list bug in the tb command where it just wouldnt work in that one specific spot
}

async function displayGPUInfo(accent) {
	let canvas = document.createElement("canvas");
	let gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	if (!gl) {
		displayOutput("%cGPU%c: Information not available", `color: ${accent}`, "color: #b6b6b6");
		return;
	}
	let dbgRenderInfo = gl.getExtension("WEBGL_debug_renderer_info");
	if (dbgRenderInfo) {
		let rndr = gl.getParameter(dbgRenderInfo.UNMASKED_RENDERER_WEBGL);
		let regex = /ANGLE \(.+?,\s*(.+?) \(/;
		let match = rndr.match(regex);
		let gpuName = match ? match[1] : "";
		displayOutput(`				  %cGPU%c: ${gpuName}`, `color: ${accent}`, "color: #b6b6b6");
	} else {
		displayOutput("				  %cGPU%c: Information not available", `color: ${accent}`, "color: #b6b6b6");
	}
	return true;
}

async function getStorage(accent) {
	const estimate = await navigator.storage.estimate();
	const totalSize = estimate.quota;
	const usedSize = estimate.usage;
	const usedPercentage = (usedSize / totalSize) * 100;
	let formattedUsedSize, formattedTotalSize;
	if (usedSize >= 1024 * 1024 * 1024) {
		formattedUsedSize = `${(usedSize / (1024 * 1024 * 1024)).toFixed(2)} GB`;
	} else {
		formattedUsedSize = `${(usedSize / (1024 * 1024)).toFixed(2)} MB`;
	}
	if (totalSize >= 1024 * 1024 * 1024) {
		formattedTotalSize = `${(totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB`;
	} else {
		formattedTotalSize = `${Math.round((totalSize / (1024 * 1024)).toFixed(2))} MB`;
	}
	displayOutput("%c    ^&@@@?      B@@@@@@@@&B5~ " + `    %cStorage%c: ${formattedUsedSize} of ${formattedTotalSize}`, `color: ${accent}`, `color: ${accent}`, "color: #b6b6b6");
	return true;
}

sysfetch(args, term);
