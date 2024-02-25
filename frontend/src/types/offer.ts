type Author = {
	id: number;
	email: string;
};

export type Attachment = {
	name: string;
	file: string;
};

export type Offer = {
	id: number;
	name: string;
	description: string;
	author: Author;
	keywords: string[];
	files: Attachment[];
};
