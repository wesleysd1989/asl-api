module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('users', 'account_id', {
            type: Sequelize.INTEGER,
            references: { model: 'accounts', key: 'id' },
        });
    },

    down: queryInterface => {
        return queryInterface.removeColumn('users', 'account_id');
    },
};
