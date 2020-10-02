export default {
    service: 'Outlook365',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    default: {
        from: 'Equipe Projeto <noreply@projeto.com>',
    },
};

/* servicos de envio de email
 * Amazon SES
 * Mailgun
 * Sparkpost
 * Mandril (mailchimp)
 * Mail Trap (DEV)
 */
