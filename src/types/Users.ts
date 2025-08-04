export interface User {
    id: number,
    email: string,
    firstName: string | null,
    lastName: string | null,
    password: string,
    role: string,
    createdAt: string,
    deleted: number
}

export type UserFilterType = 0 | 1 ;
