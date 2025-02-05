'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('qr_codes', 'business_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.addColumn('qr_codes', 'umbrella_number', {
      type: Sequelize.INTEGER,
      allowNull: true, // poate fi NULL la început
    });

    await queryInterface.addConstraint('qr_codes', {
      fields: ['business_id'],
      type: 'foreign key',
      name: 'fk_qr_codes_business',
      references: {
        table: 'businesses',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('qr_codes', 'fk_qr_codes_business');
    await queryInterface.removeColumn('qr_codes', 'business_id');
    await queryInterface.removeColumn('qr_codes', 'umbrella_number');
  },
};
