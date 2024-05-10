export const htmlToPlainText = (html: string) => {
	const text = html
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
		.replace(/<br\s*\/?>/gi, " ")
		.replace(/<\/?(h1|h2|h3|h4|h5|h6|div|p|ul|ol|li|tr|td|th|a|strong|em|span|blockquote|[bi]|pre|code|img|tt|ins|del|sup|sub|table|thead|tbody|tfoot|dl|dt|dd|kbd|q|samp|var|hr|ruby|rt|rp|s|strike)[^>]*>/gi, " ")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	return text;
};
