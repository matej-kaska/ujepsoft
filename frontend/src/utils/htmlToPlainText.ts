export const htmlToPlainText = (html: string) => {
	return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "").replace(/<\/?(p|ul|li|em|span|ol|strong|del|ins)[^>]*>|\\n/g, " ");
};
