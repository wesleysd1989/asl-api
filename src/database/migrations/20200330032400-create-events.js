module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.createTable('events', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            commemorative_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'commemoratives', key: 'id' },
                onDelete: 'CASCADE',
            },
            image_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'images', key: 'id' },
            },
            status: {
                type: Sequelize.ENUM,
                values: ['ACTIVE', 'PENDING', 'FINISHED', 'BLOCKED', 'DELETED'],
                defaultValue: 'PENDING',
                allowNull: false,
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
        return queryInterface.dropTable('events');
    },
};
