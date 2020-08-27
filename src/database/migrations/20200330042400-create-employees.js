module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('employees', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            full_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            events_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'events', key: 'id' },
                onDelete: 'CASCADE',
            },
            status: {
                type: Sequelize.ENUM,
                values: ['SENT', 'WAITING'],
                defaultValue: 'WAITING',
                allowNull: false,
            },
            deleted: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            date_to_send: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        });
    },

    down: queryInterface => {
        return queryInterface.dropTable('employees');
    },
};
