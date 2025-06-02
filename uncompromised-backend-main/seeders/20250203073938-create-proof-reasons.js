'use strict';

const { ProofReason, sequelize } = require('../models');
const { Op } = require('sequelize');

const PRE_DEFINED_COMMENTS = [
  { name: 'बीज समय पर नहीं मिल सके', type: 'not_completed' },
  { name: 'तबियत खराब थी', type: 'not_completed' },
  { name: 'बारिश के कारण काम पूरा नहीं हो सका', type: 'not_completed' },
  { name: 'उपकरण ख़राब है', type: 'not_completed' },
  { name: 'काम पूरा हो गया', type: 'completed' },
  { name: 'उपकरण अपनी जगह पर रख दिए गए हैं', type: 'completed' },
  { name: 'सभी प्रक्रिया पूरी की गई', type: 'completed' },
  { name: 'उपकरण सही स्थिति में थे', type: 'completed' }
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up() {
    const transaction = await sequelize.transaction();

    await Promise.all(
      PRE_DEFINED_COMMENTS.map(comment =>
        ProofReason.findOrCreate({
          where: {
            name: comment.name,
            type: comment.type
          },
          default: {
            name: comment.name,
            type: comment.type
          },
          transaction
        })
      )
    );

    await transaction.commit();
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'proof_reasons',
      {
        name: { [Op.in]: PRE_DEFINED_COMMENTS.map(comment => comment.name) },
        type: { [Op.in]: PRE_DEFINED_COMMENTS.map(comment => comment.type) }
      },
      {}
    );
  }
};
