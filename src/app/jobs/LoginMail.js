import Mail from '../../lib/Mail';

class LoginMail {
    get key() {
        return 'LoginMail';
    }

    async handle({ data }) {
        const user = data;

        await Mail.sendMail({
            to: `${user.name} <${user.email}>`,
            subject: 'login',
            template: 'login',
            context: {
                user: user.name,
            },
        });
    }
}

export default new LoginMail();
