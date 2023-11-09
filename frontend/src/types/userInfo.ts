export type TUserInfo = {
    id: string | undefined;
    email: string | undefined;
    is_staff: boolean | undefined;
}

export const blankUserInfo: TUserInfo = {
    id: undefined,
    email: undefined,
    is_staff: undefined,
}