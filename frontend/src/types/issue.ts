export type Issue = {
	id: number;
	number: number;
	title: string;
	body: string | null;
	repo: Repo;
	state: string;
	labels: string[];
	author: string;
	comments_count: number;
	author_profile_pic: string;
	author_ujepsoft: string;
	files: Attachment[];
	created_at: string;
	updated_at: string;
};

export type Attachment = {
	name: string;
	file: string;
	file_type: "image" | "file";
};

type Repo = {
	id: number;
	name: string;
	author: string;
};

export type FullIssue = {
	id: number;
	number: number;
	title: string;
	body: string | null;
	repo: Repo;
	state: string;
	labels: string[];
	author: string;
	comments: Comment[];
	author_profile_pic: string;
	author_ujepsoft: string;
	files: Attachment[];
	created_at: string;
	updated_at: string;
};

export type Comment = {
	author: string;
	author_profile_pic: string;
	author_ujepsoft: string;
	body: string;
	created_at: string;
	updated_at: string;
	id: number;
	files: Attachment[];
	number: number;
};
