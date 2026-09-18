/**
 * @module getFileTree
 */

/**
 * Builds a full file tree for Magma's File System
 * @param path The path to start at
 * @returns The flat file tree
 */
export default async function getFileTree(path = "/") {
	const tree: Record<string, string> = {};

	async function traverse(path: string): Promise<void> {
		const stat = await window.parent.tb.fs.promises.stat(path);

		if (stat.isDirectory()) {
			const entries = await window.parent.tb.fs.promises.readdir(path);
			for (const entry of entries) {
				if (entry === "." || entry === "..") continue;

				const newPath = path.endsWith("/") ? `${path}${entry}` : `${path}/${entry}`;
				await traverse(newPath);
			}
		} else if (stat.isFile()) {
			const contents = await window.parent.tb.fs.promises.readFile(path, "utf8");
			tree[path] = contents;
		}
	}

	await traverse(path);

	return tree;
}
