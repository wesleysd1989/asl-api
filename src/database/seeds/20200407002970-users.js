module.exports = {
    up: queryInterface => {
        return queryInterface.bulkInsert(
            'users',
            [
                {
                    name: 'administrator',
                    phone: '(99)999999999',
                    type: 1,
                    birth: '2020-04-03 12:53:05.356+00',
                    created_at: '2020-04-03 12:53:05.356+00',
                    updated_at: '2020-04-03 12:53:05.356+00',
                    account_id: 1,
                },
            ],
            {}
        );
    },

    down: queryInterface => {
        return queryInterface.bulkDelete('users', null, {});
    },
};
