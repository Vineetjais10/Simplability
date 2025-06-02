'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const enumValues = ['normal', 'moderate', 'critical'];

    // Step 1: Replace all invalid values with a valid ENUM value
    await queryInterface.sequelize.query(`
      UPDATE "farms_tasks"
      SET "priority" = 'normal'
      WHERE "priority" IS NULL OR "priority" = '' OR "priority" NOT IN ('normal', 'moderate', 'critical');
    `);

    // Step 2: Remove the existing default value
    await queryInterface.sequelize.query(`
      ALTER TABLE "farms_tasks"
      ALTER COLUMN "priority" DROP DEFAULT;
    `);

    // Step 3: Change the column type to ENUM
    await queryInterface.changeColumn('farms_tasks', 'priority', {
      type: Sequelize.ENUM(...enumValues),
      allowNull: false
    });

    // Step 4: Set the new default value
    await queryInterface.sequelize.query(`
      ALTER TABLE "farms_tasks"
      ALTER COLUMN "priority" SET DEFAULT 'normal';
    `);
  },

  async down(queryInterface, Sequelize) {
    // Step 1: Remove the default value
    await queryInterface.sequelize.query(`
      ALTER TABLE "farms_tasks"
      ALTER COLUMN "priority" DROP DEFAULT;
    `);

    // Step 2: Revert the column type back to STRING
    await queryInterface.changeColumn('farms_tasks', 'priority', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // Step 3: Drop the ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_farms_tasks_priority";
    `);
  }
};
