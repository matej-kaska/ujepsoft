type Author = {
	id: number;
	email: string;
};

export type Attachment = {
	name: string;
	file: string;
	file_type: "image" | "file";
	remote_url?: string;
};

export type Offer = {
	id: number;
	name: string;
	description: string;
	author: Author;
	keywords: string[];
	files: Attachment[];
};
