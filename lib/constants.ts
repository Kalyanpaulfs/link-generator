export const PROTECTED_EMAILS = [
    'kalyanpaulfs@gmail.com',
    'paulkalyan3@gmail.com'
];

export const isProtected = (email: string) => {
    return PROTECTED_EMAILS.includes(email.toLowerCase());
};
