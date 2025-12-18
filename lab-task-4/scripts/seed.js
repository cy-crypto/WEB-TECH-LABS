const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/play-cards-store';
IMAGE_PATH = "/assets/home_play_prizes.png";
const seedProducts = [
  { name: 'Dragon Flame Card', price: 1500, category: 'Fantasy', rarity: 'Legendary', image: IMAGE_PATH, description: 'A legendary card imbued with the power of dragon fire.' },
  { name: 'Shadow Assassin Card', price: 900, category: 'Action', rarity: 'Rare', image: IMAGE_PATH, description: 'A rare card used by elite shadow assassins.' },
  { name: 'Mystic Wizard Card', price: 1200, category: 'Magic', rarity: 'Epic', image: IMAGE_PATH, description: 'An epic wizard card with powerful spell abilities.' },
  { name: 'Forest Guardian Card', price: 600, category: 'Nature', rarity: 'Common', image: IMAGE_PATH, description: 'A common guardian card that protects the forest realm.' },
  { name: 'Phoenix Rebirth Card', price: 1800, category: 'Fantasy', rarity: 'Legendary', image: IMAGE_PATH, description: 'A legendary card that rises from ashes.' },
  { name: 'Stealth Ninja Card', price: 850, category: 'Action', rarity: 'Rare', image: IMAGE_PATH, description: 'A rare ninja card for covert missions.' },
  { name: 'Arcane Sorcerer Card', price: 1300, category: 'Magic', rarity: 'Epic', image: IMAGE_PATH, description: 'Epic card wielding arcane magic.' },
  { name: 'Earth Elemental Card', price: 700, category: 'Nature', rarity: 'Common', image: IMAGE_PATH, description: 'A card representing the power of earth.' },
  { name: 'Lightning Strike Card', price: 1400, category: 'Fantasy', rarity: 'Epic', image: IMAGE_PATH, description: 'Strike your enemy with the speed of lightning.' },
  { name: 'Silent Rogue Card', price: 950, category: 'Action', rarity: 'Rare', image: IMAGE_PATH, description: 'A stealthy rogue ready for missions.' },
  { name: 'Enchanted Elf Card', price: 1100, category: 'Magic', rarity: 'Epic', image: IMAGE_PATH, description: 'A mystical elf with enchanted powers.' },
  { name: 'River Spirit Card', price: 650, category: 'Nature', rarity: 'Common', image: IMAGE_PATH, description: 'A gentle spirit of the river.' },
  { name: 'Inferno Dragon Card', price: 1600, category: 'Fantasy', rarity: 'Legendary', image: IMAGE_PATH, description: 'A ferocious dragon with flames.' },
  { name: 'Assassin Phantom Card', price: 900, category: 'Action', rarity: 'Rare', image: IMAGE_PATH, description: 'A rare phantom assassin strikes from shadows.' },
  { name: 'Wizard Apprentice Card', price: 1200, category: 'Magic', rarity: 'Epic', image: IMAGE_PATH, description: 'Apprentice wizard ready to cast spells.' },
  { name: 'Mountain Guardian Card', price: 600, category: 'Nature', rarity: 'Common', image: IMAGE_PATH, description: 'Guardian of the mountains.' },
  { name: 'Celestial Knight Card', price: 1700, category: 'Fantasy', rarity: 'Legendary', image: IMAGE_PATH, description: 'A knight blessed by the stars.' },
  { name: 'Shadow Stalker Card', price: 950, category: 'Action', rarity: 'Rare', image: IMAGE_PATH, description: 'A rare stalker lurking in shadows.' },
  { name: 'Mystic Enchanter Card', price: 1250, category: 'Magic', rarity: 'Epic', image: IMAGE_PATH, description: 'An enchanter with mystical powers.' },
  { name: 'Forest Sprite Card', price: 650, category: 'Nature', rarity: 'Common', image: IMAGE_PATH, description: 'A tiny sprite protecting the forest.' },
  { name: 'Dragon Rider Card', price: 1550, category: 'Fantasy', rarity: 'Legendary', image: IMAGE_PATH, description: 'Ride a dragon into battle.' },
  { name: 'Ninja Shadow Card', price: 880, category: 'Action', rarity: 'Rare', image: IMAGE_PATH, description: 'A stealthy ninja in shadows.' },
  { name: 'Arcane Mage Card', price: 1300, category: 'Magic', rarity: 'Epic', image: IMAGE_PATH, description: 'Mage skilled in arcane arts.' },
  { name: 'Wild Wolf Card', price: 700, category: 'Nature', rarity: 'Common', image: IMAGE_PATH, description: 'A common wolf roaming the wild.' },
  { name: 'Flame Sorceress Card', price: 1450, category: 'Fantasy', rarity: 'Epic', image: IMAGE_PATH, description: 'Sorceress commanding fire.' },
  { name: 'Silent Blade Card', price: 920, category: 'Action', rarity: 'Rare', image: IMAGE_PATH, description: 'Rare blade used by silent assassins.' },
  { name: 'Elven Healer Card', price: 1150, category: 'Magic', rarity: 'Epic', image: IMAGE_PATH, description: 'Healer with powerful elven magic.' },
  { name: 'Meadow Guardian Card', price: 680, category: 'Nature', rarity: 'Common', image: IMAGE_PATH, description: 'Protector of the meadow.' },
  { name: 'Titan Dragon Card', price: 1750, category: 'Fantasy', rarity: 'Legendary', image: IMAGE_PATH, description: 'A mighty dragon of legend.' },
  { name: 'Rogue Shadow Card', price: 940, category: 'Action', rarity: 'Rare', image: IMAGE_PATH, description: 'A rare shadowy rogue.' },
  { name: 'Sorcerer Supreme Card', price: 1350, category: 'Magic', rarity: 'Epic', image: IMAGE_PATH, description: 'Supreme master of magical arts.' },
  { name: 'River Guardian Card', price: 660, category: 'Nature', rarity: 'Common', image: IMAGE_PATH, description: 'Protector of river realms.' },
  { name: 'Phoenix Knight Card', price: 1650, category: 'Fantasy', rarity: 'Legendary', image: IMAGE_PATH, description: 'Knight reborn from phoenix fire.' },
  { name: 'Stealth Hunter Card', price: 910, category: 'Action', rarity: 'Rare', image: IMAGE_PATH, description: 'A hunter moving silently in shadows.' },
  { name: 'Mystic Warlock Card', price: 1280, category: 'Magic', rarity: 'Epic', image: IMAGE_PATH, description: 'Warlock with powerful spells.' },
  { name: 'Forest Elf Card', price: 670, category: 'Nature', rarity: 'Common', image: IMAGE_PATH, description: 'Elf protecting the enchanted forest.' },
  { name: 'Dragon Emperor Card', price: 1800, category: 'Fantasy', rarity: 'Legendary', image: IMAGE_PATH, description: 'The emperor of all dragons.' },
  { name: 'Night Assassin Card', price: 930, category: 'Action', rarity: 'Rare', image: IMAGE_PATH, description: 'A deadly assassin of the night.' },
  { name: 'Arcane Wizard Card', price: 1320, category: 'Magic', rarity: 'Epic', image: IMAGE_PATH, description: 'Wizard mastering arcane spells.' },
  { name: 'Mountain Sprite Card', price: 690, category: 'Nature', rarity: 'Common', image: IMAGE_PATH, description: 'Sprite guarding mountain lands.' },
  { name: 'Celestial Dragon Card', price: 1720, category: 'Fantasy', rarity: 'Legendary', image: IMAGE_PATH, description: 'A dragon blessed by the heavens.' },
  { name: 'Shadow Ninja Card', price: 960, category: 'Action', rarity: 'Rare', image: IMAGE_PATH, description: 'A ninja lurking in shadows.' }

];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert seed products
    const products = await Product.insertMany(seedProducts);
    console.log(`Seeded ${products.length} products`);

    await mongoose.connection.close();
    console.log('Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();

