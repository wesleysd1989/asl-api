import Mail from '../../lib/Mail';

class RegistrationMail {
    get key() {
        return 'RegistrationMail';
    }

    async handle({ data }) {
        const user = data.sendData;

        await Mail.sendMail({
            to: `${user.name} <${user.email}>`,
            subject: 'registration',
            template: 'registration',
            context: {
                user: user.name,
                link: user.link,
            },
        });
    }
}

export default new RegistrationMail();
