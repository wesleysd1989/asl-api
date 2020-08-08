module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn('accounts', 'recovery', {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        });
    },

    down: queryInterface => {
        return queryInterface.removeColumn('accounts', 'recovery');
    },
};
