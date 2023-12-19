export type Issue = {
    id: number;
    number: number;
    title: string;
    body: string | null;
    repo: string;
    state: string;
    labels: string[];
    author: string;
    comments: number;
    author_profile_pic: string;
    created_at: string;
    updated_at: string;
}