type Author = {
    id: number;
    email: string;
}

type File = {
    name: string;
    file: string;
}

export type Offer = {
    id: number;
    name: string;
    description: string;
    author: Author;
    keywords: string[];
    files: File[];
}