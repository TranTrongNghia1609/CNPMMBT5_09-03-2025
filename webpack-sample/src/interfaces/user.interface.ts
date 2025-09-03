export interface User {
    id?: number;
    username: string;
    email: string;
    password: string;
    created_at?: Date;
}
export interface PaginationResult {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}