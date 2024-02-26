export const htmlToPlainText = (html: string) => {
	const text = html
		.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
		.replace(/<\/?(h1|h2|h3|h4|h5|h6|h7|h8|br|b|i|strong|em|a|pre|code|img|tt|div|ins|del|sup|sub|p|ol|ul|table|thead|tbody|tfoot|blockquote|dl|dt|dd|kbd|q|samp|var|hr|ruby|rt|rp|li|tr|td|th|s|strike)[^>]*>|\\n/g, " ")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&amp;/g, "&")
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, " ");
	return text;
};
