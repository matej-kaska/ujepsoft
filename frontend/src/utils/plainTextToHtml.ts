const linkify = (text: string) => {
	const urlRegex = /(\b((https?|ftp|file):\/\/|www\.)[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
	return text.replace(urlRegex, (url) => `<a href="${url.match(/^https?:/) ? url : `//${url}`}" target="_blank" rel="noreferrer">${url}</a>`);
};

export const formatDescription = (description: string, skipParag = false) => {
	if (!description) return;
	let newDescription: string | null = description;
	if (!skipParag) {
		if (!newDescription.startsWith("<p>")) newDescription = `<p>${newDescription}`;
		if (!newDescription.endsWith("</p>/n")) newDescription = `${newDescription}</p>`;
	}
	return linkify(
		newDescription
			.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
			.replace(/<p>\s?<\/p>/g, "<br>")
			.replace(/<em>/g, "<i>")
			.replace(/<\/em>/g, "</i>")
			.replace(/\\"/g, '"')
			.replace(/\\n/g, "")
			.replace(/!\[.*?\]\(.*?\)/g, "")
			.replace(/\[.*?\]\(.*?\)/g, ""),
	);
};

export const removeFooterFromBody = (body: string) => {
	let new_body = body.replace(/!\[.*?\]\(.*?\)/g, "").replace(/\[.*?\]\(.*?\)/g, "");

	const lastPClose = new_body.lastIndexOf("</p>");
	if (lastPClose === -1) return new_body;

	const lastPOpen = new_body.substring(0, lastPClose).lastIndexOf("<p");
	if (lastPOpen === -1) return new_body;

	new_body = new_body.substring(0, lastPOpen) + new_body.substring(lastPClose + 4);

	return new_body;
};
