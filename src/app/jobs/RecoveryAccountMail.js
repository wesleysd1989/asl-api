import Mail from '../../lib/Mail';

class RecoveryAccountMail {
    get key() {
        return 'RecoveryAccountMail';
    }

    async handle({ data }) {
        const user = data.sendData;

        await Mail.sendMail({
            to: `${user.name} <${user.email}>`,
            subject: 'recovery',
            template: 'recovery',
            context: {
                user: user.name,
                link: user.link,
            },
        });
    }
}

export default new RecoveryAccountMail();
