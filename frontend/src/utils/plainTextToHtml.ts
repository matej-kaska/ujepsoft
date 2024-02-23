const linkify = (text: string) => {
	const urlRegex = /(\b((https?|ftp|file):\/\/|www\.)[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;
	return text.replace(urlRegex, (url) => `<a href="${url.match(/^https?:/) ? url : `//${url}`}" target="_blank" rel="noreferrer">${url}</a>`);
};

export const formatDescription = (description: string) => {
	if (!description) return;
	let newDescription: string | null = description;
	if (!newDescription.startsWith("<p>")) newDescription = `<p>${newDescription}`;
	if (!newDescription.endsWith("</p>/n")) newDescription = `${newDescription}</p>`;
	return linkify(
		newDescription
			.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
			.replace(/<p>\s?<\/p>/g, "<br>")
			.replace(/<em>/g, "<i>")
			.replace(/<\/em>/g, "</i>")
			.replace(/\\"/g, '"')
			.replace(/\\n/g, ""),
	);
};
