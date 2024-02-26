import { number } from "yup";

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
	reactions: Reaction[];
};

export type Comment = {
	author: string;
	author_profile_pic: string;
	author_ujepsoft: string;
	body: string;
	created_at: string;
	updated_at: string;
	id: number;
	reactions: Reaction[];
	files: Attachment[];
	number: number;
};

// biome-ignore lint: Maybe will be added
export type Reaction = {};
