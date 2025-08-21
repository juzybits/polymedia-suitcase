/**
 * Encode a URL for use in CSS `url()` syntax.
 */
export function makeCssUrl(url: string): string {
	return (
		"url(" +
		encodeURI(url) // encode the URL
			.replace(/\(/g, "%28") // encode '('
			.replace(/\)/g, "%29") + // encode ')'
		")"
	);
}
