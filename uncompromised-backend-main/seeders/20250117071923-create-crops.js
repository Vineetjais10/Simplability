'use strict';

const { Crop, sequelize } = require('../models');

const crops = [
  'Swiss Chard',
  'Lettuce',
  'Celery',
  'Tomato (Cherry)',
  'Parsley (Curly)',
  'Curry Leaves',
  'Lemongrass',
  'Oregano',
  'Shyama Tulsi',
  'Arugula',
  'Spearmint',
  'Stevia',
  'Sweet Basil',
  'Thyme',
  'Okra',
  'Tinda',
  'Tomato (Desi)',
  'Ridge Gourd',
  'Spinach',
  'Cow Pea',
  'Red Amaranthus',
  'Green Amaranthus',
  'Cluster Beans',
  'Rosemary',
  'Red Okra',
  'Watermelon',
  'Tomato (Hybrid)',
  'Chilli (Big)',
  'Capsicum',
  'Parsley (Flat Leaf)',
  'Chilli (Green)',
  'Brinjal (Long)',
  'Brinjal (Normal)',
  'Lime',
  'Moringa',
  'Bitter Gourd',
  'Marigold',
  'Coriander',
  'Custard Apple',
  'Fenugreek',
  'Bottle Gourd',
  'Zucchini',
  'Cucumber',
  'Kakdi',
  'Mint',
  'Summer Squash',
  'Musk Melon',
  'Spring Onion',
  'Pumpkin',
  'Karonda',
  'Amla',
  'Papaya',
  'Chikoo',
  'Mango (Totapuri)',
  'Sweet Corn',
  'Karna',
  'Guava',
  'Sunflower',
  'Bijora',
  'Turnip',
  'White Radish',
  'Garlic',
  'Mustard',
  'Sweet Lime',
  'Peas',
  'Sponge Gourd',
  'All'
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up() {
    const transaction = await sequelize.transaction();

    await Promise.all(
      crops.map(crop =>
        Crop.findOrCreate({
          where: {
            name: crop
          },
          default: {
            name: crop
          },
          transaction
        })
      )
    );

    await transaction.commit();
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete(
      'crops',
      {
        name: crops
      },
      {}
    );
  }
};
