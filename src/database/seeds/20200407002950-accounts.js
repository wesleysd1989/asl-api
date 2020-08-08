module.exports = {
    up: queryInterface => {
        return queryInterface.bulkInsert(
            'accounts',
            [
                {
                    email: 'wesleysd1989@mail.com',
                    password_hash:
                        '$2a$08$j9hFQxQXly96WtW.jGkch.uy3zFygiszR6ofbUFQytk1mZyyr6CZ6',
                    activeted: true,
                    group: 1,
                    social: false,
                    created_at: '2020-04-03 12:53:05.356+00',
                    updated_at: '2020-04-03 12:53:05.356+00',
                    last_login: '2020-04-03 12:53:05.356+00',
                },
            ],
            {}
        );
    },

    down: queryInterface => {
        return queryInterface.bulkDelete('accounts', null, {});
    },
};
