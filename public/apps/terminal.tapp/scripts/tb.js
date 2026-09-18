const ver = "1.0.0";

var cmdData = {
	help: {
		desc: "Shows information about a given subcommand",
		usage: "tb help <subcmd> ...",
		args: {
			subcmd: "The subcommand to look up. I.e. tb help system version",
		},
	},
	restart: {
		desc: "Restarts MagmaOS",
		usage: "tb restart <args>",
		alias: "reboot",
		args: {
			"-f/--force": "Clears the session cache upon reboot and reboots to bootloader",
			"-s/--skip-prompt": "Skips the confirm reboot prompt",
		},
	},
	process: {
		desc: "Parent command for listing magma processes.",
		usage: "tb process [subcmd] ... <args>",
		alias: "proc",
		subcmds: {
			kill: {
				desc: "Kill/delete a given process",
				usage: "tb process kill [pid]",
				alias: "delete",
				args: {
					pid: "The ID of the process to kill/delete",
				},
			},
			list: {
				desc: "[ ! BROKEN ! ] Lists all active processes",
				usage: "tb process list",
			},
		},
	},
	system: {
		desc: "Parent command for details about the magma system.",
		usage: "tb system [subcmd] ... <args>",
		alias: "sys",
		subcmds: {
			version: {
				desc: "Display the currently installed Magma version.",
				usage: "tb system version",
				alias: "ver",
			},
			exportfs: {
				desc: "Export the magma filesystem.",
				usage: "tb system exportfs",
			},
			restartNode: {
				desc: "Restarts the NodeJS Container",
				usage: "tb system restartNode",
			},
		},
	},
	application: {
		desc: "Parent command for running/modifying apps.",
		usage: "tb application [subcmd] ... <args>",
		alias: "app",
		subcmds: {
			run: {
				desc: "Runs the app located at the specified package ID",
				usage: "tb application run [app] <args>",
				alias: "open",
				args: {
					app: "The name of the app to open. Replace any spaces with an underscore ( _ ). Not case sensitive.",
					"-l/--legacy": "Toggle if the old `com.tb.appname` format should be used or not.",
					"-j/--json-file": "Process the app argument as a path to an app's configuration file.",
				},
			},
			list: {
				desc: "Lists the installed applications.",
				usage: "tb application list <args>",
				args: {
					"-d/--directory": "Shows the directory that the application is located",
					"-c/--config": "Shows the location of the app's config file",
				},
			},
		},
	},
	network: {
		desc: "Parent command for interacting with Magma's networking system",
		usage: "tb network [subcmd] ... <args>",
		alias: "net",
		subcmds: {
			proxy: {
				desc: "Parent command for modifying/reading info about the current proxy.",
				usage: "tb network proxy [subcmd] ... <args>",
				subcmds: {
					active: {
						desc: "Prints the active proxy in use by Magma.",
						usage: "tb network proxy active",
					},
					set: {
						desc: "Change the proxy that Magma will use",
						usage: "tb network proxy set [proxy]",
						args: {
							proxy: "The name of the proxy to switch to. CASE SENSITIVE!!!",
						},
					},
				},
			},
		},
	},
	node: {
		desc: "Parent command for interacting with Magma's NodeJS container",
		usage: "tb node [subcmd] ... <args>",
		subcmds: {
			restart: {
				desc: "Restarts the NodeJS container",
				usage: "tb node restart",
			},
			start: {
				desc: "Starts the NodeJS container",
				usage: "tb node start",
			},
			stop: {
				desc: "Stops the NodeJS container",
				usage: "tb node stop",
			},
		},
	},
};

async function tb(args) {
	function error(err) {
		displayError(`${err}\n`);
		createNewCommandInput();
	}
	function help(args) {
		function resolveCommand(args) {
			let current = cmdData;
			for (let i = 1; i < args.length; i++) {
				const input = args[i];
				const scope = current.subcmds || current;
				const match = Object.entries(scope).find(([key, val]) => key === input || val.alias === input);
				if (!match) {
					displayOutput(`Unknown command or alias: ${input}`);
					return null;
				}
				current = match[1];
			}
			if (args.length === 1) {
				current.v = true;
			}
			return current;
		}
		function formatData(info) {
			if (typeof info.v === "undefined") {
				displayOutput(`Description: ${info.desc}\n`);
				displayOutput(`USAGE: ${info.usage}`);
				if (info.alias) displayOutput(`ALIAS(ES): ${info.alias}\n`);
				if (info.subcmds) {
					displayOutput("SUBCOMMANDS:");
					const subkeys = Object.keys(info.subcmds);
					for (let i = 0; i < subkeys.length; i++) {
						displayOutput(`${`${subkeys[i]} ${info.subcmds[subkeys[i]].alias ? `(alias: ${info.subcmds[subkeys[i]].alias})` : ""}`.padEnd(40)}${info.subcmds[subkeys[i]].desc}\n`);
					}
				} else if (info.args) {
					displayOutput("ARGUMENTS:");
					const subkeys = Object.keys(info.args);
					for (let i = 0; i < subkeys.length; i++) {
						displayOutput(`${`${subkeys[i]}`.padEnd(40)}${info.args[subkeys[i]]}\n`);
					}
				}
			} else {
				delete info.v;
				displayOutput('Any commands listed as "parent" commands have subcommands. Use `tb help <cmd>` to view it\'s commands.');
				displayOutput("List of available commands:\n");
				const cmdKeys = Object.keys(cmdData);
				for (let i = 0; i < cmdKeys.length; i++) {
					displayOutput(`${`${cmdKeys[i]} ${cmdData[cmdKeys[i]].alias ? `(alias: ${cmdData[cmdKeys[i]].alias})` : ""}`.padEnd(40)}${cmdData[cmdKeys[i]].desc}\n`);
				}
			}
		}
		const data = resolveCommand(args);
		if (data != null) {
			formatData(data);
		}
		displayOutput(`Magma System CLI v${ver}`);
		createNewCommandInput();
	}
	switch (args._[0]) {
		case undefined:
		case null:
			help(["help"]);
			break;
		case "help":
			help(args._);
			break;
		case "restart":
		case "reboot": {
			function handleReboot() {
				if (args.f || args.force) {
					window.parent.sessionStorage.clear();
					window.parent.location.reload();
				} else {
					window.parent.sessionStorage.setItem("logged-in", "false");
					window.parent.location.reload();
				}
			}
			if (args.s || args.skipPrompt) {
				handleReboot();
			} else {
				await window.parent.tb.dialog.Permissions({
					title: "Confirm restart",
					message: "Are you sure you want to restart Magma?",
					onOk: () => {
						handleReboot();
					},
					onCancel: () => {
						error("tb > restart > operation aborted by user");
					},
				});
			}
			break;
		}
		case "lock":
			window.parent.sessionStorage.setItem("logged-in", false);
			window.parent.location.reload();
			break;
		case "process":
		case "proc":
			switch (args._[1]) {
				case undefined:
				case null:
					error("tb > process > expected an argument at pos 3, got nothing");
					break;
				case "kill":
				case "delete":
					if (args._[2] === undefined) {
						error("tb > process > kill > expected an argument at pos 4, got nothing");
					} else {
						window.parent.tb.process.kill(args._[2]);
					}
					createNewCommandInput();
					break;
				case "list": {
					/*
					const proclist = window.parent.tb.process.list();
					const proclistIDs = Object.keys(proclist);
					for (let i = 0; i < proclist.length; i++) {
						displayOutput(`"${typeof proclist[i].name === "string" ? proclist[i].name : proclist[i].name.text}" [PID: ${proclistIDs[i]}]`);
					}
					createNewCommandInput();
					*/
					error("tb > process > list > This command is currently broken. If you need to see a list of process ID's, please use task manager for now");
					break;
				}
				default:
					error(`tb > process > unknown subcommand: ${args._[1]}`);
			}
			break;
		case "sys":
		case "system":
			switch (args._[1]) {
				case undefined:
				case null:
					error("tb > system > expected an argument at pos 3, got nothing");
					break;
				case "ver":
				case "version":
					displayOutput(`MagmaOS version ${window.parent.tb.system.version()}`);
					createNewCommandInput();
					break;
				case "exportfs":
					window.parent.tb.setCommandProcessing(true);
					displayOutput("! WARNING !");
					displayOutput("Using this command may cause the tab to freeze momentarily.");
					displayOutput("DO NOT close this tab until the file finishes downloading.");
					await window.parent.tb.system.exportfs();
					window.parent.tb.setCommandProcessing(false);
					displayOutput("Success!");
					createNewCommandInput();
					break;
				default:
					error(`tb > system > unknown subcommand: ${args._[1]}`);
			}
			break;
		case "application":
		case "app":
			switch (args._[1]) {
				case undefined:
				case null:
					error("tb > application > expected an argument at pos 3, got nothing");
					break;
				case "run":
				case "open": {
					if (args._[2] === undefined) {
						error("tb > application > run > expected an argument at pos 4, got nothing");
					} else {
						try {
							if (args.l || args.legacy) {
								if (args._[3]) {
									await window.parent.tb.system.openApp(args._[2], { rest: args._[3] });
									createNewCommandInput();
								} else {
									await window.parent.tb.system.openApp(args._[2]);
									createNewCommandInput();
								}
							} else {
								// biome-ignore lint/correctness/noInnerDeclarations: variable isnt needed at the root, keep it at the current scope
								var resolvedAppConfigFile = "";
								if (args.j || args.jsonFile) resolvedAppConfigFile = args._[2];
								else {
									const trueApp = args._[2].split("_").join(" ");
									const apps = JSON.parse(await window.parent.tb.fs.promises.readFile("/apps/installed.json", "utf8"));
									const app = apps.find(obj => obj.name.toLowerCase() === trueApp.toLowerCase());
									if (app === undefined) resolvedAppConfigFile = undefined;
									else resolvedAppConfigFile = app.config;
								}
								if (resolvedAppConfigFile === undefined) error("tb > application > run > could not find that app");
								else {
									const appConfig = JSON.parse(await window.parent.tb.fs.promises.readFile(resolvedAppConfigFile)).config;
									window.parent.tb.window.create(appConfig);
									createNewCommandInput();
								}
							}
						} catch (e) {
							error(`tb > application > run > failed to open app: ${e.message}`);
						}
					}
					break;
				}
				case "list": {
					const apps = JSON.parse(await window.parent.tb.fs.promises.readFile("/apps/installed.json", "utf8"));
					for (const app of apps) {
						displayOutput(`"${app.name}"${args.d || args.directory ? ` (Directory: ${app.config.replace("index.json", "")})` : ""}${args.c || args.config ? ` (Configuration: ${app.config})` : ""}`);
					}
					createNewCommandInput();
					break;
				}
				default:
					error(`tb > application > unknown subcommand: ${args._[1]}`);
			}
			break;
		case "network":
		case "net":
			switch (args._[1]) {
				case "proxy":
					switch (args._[2]) {
						case "active":
							displayOutput(`Active proxy: ${await window.parent.tb.proxy.get()}`);
							createNewCommandInput();
							break;
						case "set":
							if (typeof args._[3] !== "undefined") {
								displayOutput((await window.parent.tb.proxy.set(args._[3])) ? `Successfully set the active proxy to ${args._[3]}` : `Could not set the active proxy to ${args._[3]}.`);
								createNewCommandInput();
							} else {
								error("tb > network > proxy > set > expected an argument at pos 5, got nothing");
							}
							break;
						default:
							error(`tb > network > proxy > unknown subcommand: ${args._[2]}`);
							break;
					}
					break;
				default:
					error(`tb > network > unknown subcommand: ${args._[1]}`);
					break;
			}
			break;
		case "node":
			switch (args._[1]) {
				case "restart":
					window.parent.tb.setCommandProcessing(true);
					displayOutput("Restarting NodeJS container...");
					try {
						await window.parent.tb.node.stop();
						displayOutput("container stopped successfullty. starting...");
						await window.parent.tb.node.start();
						displayOutput("Container restarted.");
						window.parent.tb.setCommandProcessing(false);
						createNewCommandInput();
					} catch (e) {
						error("tb > node > restart > Could not restart the NodeJS container.");
					}
					window.parent.tb.setCommandProcessing(false);
					createNewCommandInput();
					break;
				case "start":
					window.parent.tb.setCommandProcessing(true);
					if (window.parent.tb.node.isReady) {
						displayOutput("NodeJS container is already running.");
					} else {
						displayOutput("Starting NodeJS container...");
						try {
							window.parent.tb.node.start();
							displayOutput("Successfully started the NodeJS container.");
						} catch (_) {
							error("tb > node > start > An error occured while starting the NodeJS container.");
						}
					}
					window.parent.tb.setCommandProcessing(false);
					createNewCommandInput();
					break;
				case "stop":
					window.parent.tb.setCommandProcessing(true);
					if (window.parent.tb.node.isReady) {
						displayOutput("Stopping NodeJS container...");
						try {
							window.parent.tb.node.start();
							displayOutput("Successfully stopped the NodeJS container.");
						} catch (_) {
							error("tb > node > stop > An error occured while stopping the NodeJS container.");
						}
					} else {
						displayOutput("NodeJS container is already stopped.");
					}
					window.parent.tb.setCommandProcessing(false);
					createNewCommandInput();
					break;
				default:
					error(`tb > network > unknown subcommand: ${args._[1]}`);
					break;
			}
			break;
		default:
			error(`tb > unknown subcommand: ${args._[0]}`);
			break;
	}
}
tb(args, term);
