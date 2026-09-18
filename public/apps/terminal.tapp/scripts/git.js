async function git(args) {
	let user = await window.parent.tb.user.username();
	let currentPath = path;
	if (currentPath.startsWith("~")) currentPath = currentPath.replace("~", `/home/${window.parent.sessionStorage.getItem("currAcc")}`);
	let cmds = [
		"\ start a working area",
		"clone: Clone a repository into a new directory",
		"init: Create an empty Git repository or reinitialize an existing one",
		"\ work on the current change",
		"add: Add file contents to the index",
		"rm: Remove files from the working tree and from the index",
		"\ examine the history and state",
		"status: Show the working tree status",
		"\ grow, mark and tweak your common history",
		"commit: Record changes to the repository (Make sure to run git add <filename> <directory> before commiting)",
		"\ collaborate (Login requires your GitHub Token)",
		"fetch: Download objects and refs from another repository",
		"pull: Fetch from and integrate with another repository or a local branch",
		"push: Update remote refs along with associated objects",
	];
	try {
		if (args._raw.includes("clone")) {
			if (!args._[2]) {
				path = `/home/${sessionStorage.getItem("currAcc")}/`;
			}

			if (path !== "/" && args._[2] === "/") {
				path = args._[2];
			} else if (path !== "/") {
				path = `${currentPath}/${args._[2]}`;
			}

			displayOutput(`Cloning into '${args._[1].split(/(\\|\/)/g).pop()}'...`);
			const targetDir = args._[2] ?? `${currentPath}/${args._[1].split(/(\\|\/)/g).pop()}`;
			await window.parent.tb.fs.promises.mkdir(targetDir, { recursive: true });
			await gitfetch.clone({
				fs: window.parent.tb.fs,
				http: http,
				dir: targetDir,
				corsProxy: "https://cors.isomorphic-git.org",
				url: args._[1],
				noCheckout: false,
				singleBranch: true,
				depth: 1,
				onAuth: async () => {
					return new Promise(async resolve => {
						await window.parent.tb.dialog.WebAuth({
							title: "GitHub Authentication",
							onOk: async (username, password) => {
								resolve({ username, password });
							},
							onCancel: () => {
								displayError("Authentication was canceled");
								createNewCommandInput();
							},
						});
					});
				},
				onMessage: e => {
					displayOutput(e);
				},
			});
			await gitfetch.setConfig({
				fs: window.parent.tb.fs,
				dir: targetDir,
				path: "user.name",
				value: await window.parent.tb.user.username(),
			});
			createNewCommandInput();
		} else if (args._raw.includes("init")) {
			let path = currentPath + args._[1];
			if (!args._[1]) {
				displayError("Error: Target directory must be specified for 'git init'.");
				createNewCommandInput();
				return;
			}

			displayOutput(`Initializing empty Git repository in ${path}/.git/...`);
			await window.parent.tb.fs.promises.mkdir(`${path}/.git`, { recursive: true });
			await gitfetch.init({
				fs: window.parent.tb.fs,
				http: http,
				dir: path,
				bare: false,
				defaultBranch: "master",
				gitdir: `${path}/.git`,
			});
			displayOutput("Initialized empty Git repository.");
			createNewCommandInput();
		} else if (args._raw.includes("checkout")) {
			if (!args._[1] || !args._[2]) {
				displayOutput("Usage: git checkout <branch> <directory>");
				createNewCommandInput();
				return;
			}
			const branchName = args._[1];
			const targetDir = currentPath + args._[2];
			try {
				await gitfetch.checkout({
					fs: window.parent.tb.fs,
					dir: targetDir,
					ref: branchName,
					onMessage: e => {
						displayOutput(e);
					},
				});

				displayOutput(`Switched branch '${branchName}' in '${targetDir}'`);
			} catch (error) {
				displayError(`Error: ${error.message}`);
			}
			createNewCommandInput();
		} else if (args._raw.includes("add")) {
			if (!args._[1] || !args._[2]) {
				displayOutput("Usage: git add <file> <directory>");
				createNewCommandInput();
				return;
			}
			const filePath = args._[1];
			const targetDir = currentPath + args._[2];
			try {
				await gitfetch.add({
					fs: window.parent.tb.fs,
					dir: targetDir,
					filepath: filePath,
				});

				displayOutput(`Added '${filePath}' to staging area`);
			} catch (error) {
				displayError(`Error: ${error.message}`);
			}

			createNewCommandInput();
		} else if (args._raw.includes("rm")) {
			if (!args._[1] || !args._[2]) {
				displayOutput("Usage: git rm <file> <directory>");
				createNewCommandInput();
				return;
			}
			const filePath = args._[1];
			const targetDir = currentPath + args._[2];
			try {
				await gitfetch.remove({
					fs: window.parent.tb.fs,
					dir: targetDir,
					filepath: filePath,
				});

				displayOutput(`Removed '${filePath}' from the working tree and the index`);
			} catch (error) {
				displayError(`Error: ${error.message}`);
			}

			createNewCommandInput();
		} else if (args._raw.includes("status")) {
			displayError("Command is currently not implemented");
			createNewCommandInput();
		} else if (args._raw.includes("pull")) {
			try {
				const result = await gitfetch.pull({
					fs: window.parent.tb.fs,
					http: http,
					dir: path,
					corsProxy: "https://cors.isomorphic-git.org",
					author: {
						name: user,
					email: `${user}@magma.local`,
					},
					onMessage: e => {
						displayOutput(e);
					},
				});
				displayOutput(JSON.stringify(result, null, 2));
			} catch (error) {
				displayError(`Error: ${error.message}`);
			}
			createNewCommandInput();
		} else if (args._raw.includes("push")) {
			try {
				const result = await window.parent.tb.dialog.WebAuth({
					title: "GitHub Authentication",
					onOk: async ({ username, password }) => {
						try {
							const gitResult = await gitfetch.push({
								fs: window.parent.tb.fs,
								http: http,
								dir: path,
								corsProxy: "https://cors.isomorphic-git.org",
								remote: "origin",
								force: false,
								onMessage: e => {
									displayOutput(e);
								},
								author: {
									name: user,
								email: `${user}@magma.local`,
								},
								onAuth: () => {
									return { username, password };
								},
							});
							displayOutput(JSON.stringify(gitResult, null, 2));
						} catch (error) {
							displayError(`Error: ${error.message}`);
						} finally {
							createNewCommandInput();
						}
					},
					onCancel: () => {
						displayError("GitHub authentication canceled");
						createNewCommandInput();
					},
				});
			} catch (error) {
				displayError(`Error: ${error.message}`);
				createNewCommandInput();
			}
		} else if (args._raw.includes("fetch")) {
			if (!args._[1]) {
				displayOutput("Usage: git fetch <directory> <remote-url>");
				createNewCommandInput();
				return;
			}
			const dirName = args._[1];
			const targetDir = `${currentPath}/${dirName}/.git`;
			if (!args._[2]) {
				displayError("Error: Remote URL must be provided.");
				createNewCommandInput();
				return;
			}
			const remoteUrl = args._[2];
			try {
				await gitfetch.fetch({
					fs: window.parent.tb.fs,
					http: http,
					dir: targetDir,
					url: remoteUrl,
				});

				displayOutput("Fetch successful.");
			} catch (error) {
				displayError(`Error: ${error.message}`);
			}
			createNewCommandInput();
		} else if (args._raw.includes("commit")) {
			if (!args._[1]) {
				displayError("Error: Commit message must be provided.");
				createNewCommandInput();
				return;
			}
			const commitMessage = args._[2] || "Blank Commit";
			try {
				await gitfetch.commit({
					fs: window.parent.tb.fs,
					http: http,
					dir: path,
					corsProxy: "https://cors.isomorphic-git.org",
					author: {
						name: user,
					email: `${user}@magma.local`,
					},
					message: commitMessage,
				});
				displayOutput("Commit successful.");
			} catch (error) {
				displayError(`Error: ${error.message}`);
			}
			createNewCommandInput();
		} else if (args._raw.includes("gui")) {
			displayOutput("Opening GitGUI app...");
			try {
				await tb.system.openApp("com.tb.gitgui");
				createNewCommandInput();
			} catch (err) {
				displayError(`Error while opening GitGUI: ${err}`);
				createNewCommandInput();
			}
		} else if (args._raw.includes("version")) {
			displayOutput(`git version: ${gitfetch.version()}`);
			createNewCommandInput();
		} else {
			displayOutput("Usage: git [--version] [--help] <command> [<args>]"), displayOutput("These are common Git commands used in various situations:");
			for (let command of cmds) {
				if (command.trim() === "") {
					displayOutput("");
					continue;
				}
				if (command.startsWith("\ ")) {
					displayOutput(command.slice(1));
					continue;
				}
				let [cmd, description] = command.split(": ");
				displayOutput(`   ${cmd.padEnd(15)} ${description}`);
			}
			createNewCommandInput();
		}
	} catch (e) {
		displayError(e);
		createNewCommandInput();
	}
}

git(args);
