export const htmlToPlainText = (html: string) => {
	const text = html
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
		.replace(/<\/?(p|ul|li|em|span|ol|strong|del|ins)[^>]*>|\\n/g, " ")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'");
	return text;
};
