export const validateRegister = (username: string, email: string, password: string) => {
    if (username.length <= 2) {
        return {
            errors: [{
                field: 'username',
                message: 'username length must be greater than 2'
            }]
        }
    }
    if (username.includes('@')) {
        return {
            errors: [{
                field: 'username',
                message: 'username cannot include @sign'
            }]
        }
    }
    if (!email.includes('@')) {
        return {
            errors: [{
                field: 'email',
                message: 'please provide a valid email'
            }]
        }
    }
    if (password.length <= 2) {
        return {
            errors: [{
                field: 'password',
                message: 'password length must be greater than 2'
            }]
        }
    }
    return null;
};
