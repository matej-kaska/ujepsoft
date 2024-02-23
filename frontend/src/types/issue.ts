export type Issue = {
	id: number;
	number: number;
	title: string;
	body: string | null;
	repo: Repo;
	state: string;
	labels: string[];
	author: string;
	comments: number;
	author_profile_pic: string;
	author_ujepsoft: string;
	files: Attachment[];
	created_at: string;
	updated_at: string;
};

export type Attachment = {
	name: string;
	file: string;
};

type Repo = {
	id: number;
	name: string;
	author: string;
};
