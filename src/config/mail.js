export default {
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    requireTLS: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    tls: {
        ciphers: 'SSLv3',
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
