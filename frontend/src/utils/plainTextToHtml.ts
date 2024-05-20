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
	const footerRegex = /<p class='ujepsoft-wrapper'>[\s\S]*?<h3>Tento Issue byl vygenerován pomocí aplikace UJEP Soft<\/h3>[\s\S]*?<\/p>/;

	const footerMatch = body.match(footerRegex);

	if (footerMatch) {
		return body.replace(footerRegex, "");
	}

	return body;
};
