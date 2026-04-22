const fs = require('fs');
const path = require('path');

const imagePools = {
  Basketball: [
    'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1542652694-40abf526446e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&w=1200&q=80',
  ],
  Football: [
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1508344928928-7137b67de192?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1624880357913-a8539b0625ce?auto=format&fit=crop&w=1200&q=80',
  ],
  Hockey: [
    'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1515703407324-5f753eed20b1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1563604071375-38501235bd2e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1543326727-cf6c39f851eb?auto=format&fit=crop&w=1200&q=80',
  ],
  Skating: [
    'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1493630656041-5cba89710f64?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1510411652410-b98ac149ba75?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1564982752979-3f7cb9b88731?auto=format&fit=crop&w=1200&q=80',
  ],
  Volleyball: [
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1593786270032-441f7e914044?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=1200&q=80',
  ],
};

const sizeSets = {
  apparel: ['S', 'M', 'L', 'XL'],
  footwear: ['7', '8', '9', '10', '11'],
  oneSize: ['one-size'],
  guardFit: ['S', 'M', 'L'],
  skates: ['6', '7', '8', '9', '10', '11'],
};

const stockPattern = [14, 28, 35, 18, 22, 40, 16, 30, 12, 26, 32, 20];

const catalog = {
  Basketball: [
    { brand: 'Nike', name: 'Air Zoom Court Basketball Shoes', price: 6499, colors: ['black', 'white'], sizes: sizeSets.footwear, image: 1, tags: ['basketball', 'shoes', 'court'] },
    { brand: 'Spalding', name: 'TF-250 Indoor Basketball', price: 1499, colors: ['orange'], sizes: sizeSets.oneSize, image: 0, tags: ['basketball', 'ball', 'indoor'] },
    { brand: 'Jordan', name: 'Drive Game Jersey', price: 2299, colors: ['red', 'black'], sizes: sizeSets.apparel, image: 2, tags: ['basketball', 'jersey', 'apparel'] },
    { brand: 'Under Armour', name: 'Baseline Training Shorts', price: 1799, colors: ['black', 'grey'], sizes: sizeSets.apparel, image: 2, tags: ['basketball', 'shorts', 'training'] },
    { brand: 'Wilson', name: 'Dribble Pro Backpack', price: 2699, colors: ['navy', 'black'], sizes: sizeSets.oneSize, image: 3, tags: ['basketball', 'bag', 'gear'] },
    { brand: 'Nike', name: 'Court Grip Crew Socks', price: 699, colors: ['white', 'black'], sizes: ['M', 'L'], image: 1, tags: ['basketball', 'socks', 'essentials'] },
    { brand: 'Molten', name: 'Shot Arc Training Cone Set', price: 999, colors: ['orange'], sizes: sizeSets.oneSize, image: 3, tags: ['basketball', 'training', 'cones'] },
    { brand: 'McDavid', name: 'Elbow Compression Sleeve', price: 899, colors: ['black'], sizes: sizeSets.guardFit, image: 2, tags: ['basketball', 'support', 'sleeve'] },
    { brand: 'Jordan', name: 'Half Court Warm-Up Hoodie', price: 2999, colors: ['grey', 'black'], sizes: sizeSets.apparel, image: 2, tags: ['basketball', 'hoodie', 'warmup'] },
    { brand: 'Spalding', name: 'Metal Ball Pump Kit', price: 549, colors: ['black'], sizes: sizeSets.oneSize, image: 0, tags: ['basketball', 'pump', 'accessories'] },
    { brand: 'Peak', name: 'Rebound Wristband Set', price: 399, colors: ['blue', 'white'], sizes: sizeSets.oneSize, image: 3, tags: ['basketball', 'wristband', 'basics'] },
    { brand: 'Wilson', name: 'Precision Marker Disc Pack', price: 799, colors: ['yellow'], sizes: sizeSets.oneSize, image: 3, tags: ['basketball', 'markers', 'practice'] },
  ],
  Football: [
    { brand: 'Adidas', name: 'Predator Turf Football Boots', price: 5899, colors: ['black', 'red'], sizes: sizeSets.footwear, image: 1, tags: ['football', 'boots', 'turf'] },
    { brand: 'Puma', name: 'Orbita Match Football', price: 1699, colors: ['white', 'blue'], sizes: sizeSets.oneSize, image: 0, tags: ['football', 'ball', 'match'] },
    { brand: 'Nike', name: 'Academy Dri-FIT Jersey', price: 2199, colors: ['blue', 'white'], sizes: sizeSets.apparel, image: 2, tags: ['football', 'jersey', 'apparel'] },
    { brand: 'Umbro', name: 'Club Match Shorts', price: 1299, colors: ['black', 'navy'], sizes: sizeSets.apparel, image: 2, tags: ['football', 'shorts', 'training'] },
    { brand: 'Under Armour', name: 'Goalkeeper Grip Gloves', price: 1999, colors: ['lime', 'black'], sizes: ['8', '9', '10'], image: 3, tags: ['football', 'gloves', 'goalkeeper'] },
    { brand: 'Adidas', name: 'X League Shin Guards', price: 1099, colors: ['white', 'silver'], sizes: sizeSets.guardFit, image: 1, tags: ['football', 'shin-guards', 'protection'] },
    { brand: 'Kipsta', name: 'Team Captain Armband', price: 349, colors: ['yellow'], sizes: sizeSets.oneSize, image: 0, tags: ['football', 'captain', 'basics'] },
    { brand: 'Nike', name: 'Strike Over-the-Calf Socks', price: 749, colors: ['white', 'black'], sizes: ['M', 'L'], image: 2, tags: ['football', 'socks', 'essentials'] },
    { brand: 'Puma', name: 'Sideline Duffel Bag', price: 2499, colors: ['black', 'grey'], sizes: sizeSets.oneSize, image: 3, tags: ['football', 'bag', 'gear'] },
    { brand: 'Nivia', name: 'Speed Marker Cones Set', price: 699, colors: ['orange'], sizes: sizeSets.oneSize, image: 0, tags: ['football', 'training', 'cones'] },
    { brand: 'Umbro', name: 'Lightweight Training Bib', price: 499, colors: ['green'], sizes: sizeSets.apparel, image: 2, tags: ['football', 'bib', 'practice'] },
    { brand: 'Nike', name: 'All-Weather Pump Kit', price: 599, colors: ['black'], sizes: sizeSets.oneSize, image: 0, tags: ['football', 'pump', 'accessories'] },
  ],
  Hockey: [
    { brand: 'Bauer', name: 'Vapor Composite Hockey Stick', price: 5299, colors: ['black', 'yellow'], sizes: sizeSets.oneSize, image: 0, tags: ['hockey', 'stick', 'composite'] },
    { brand: 'CCM', name: 'JetSpeed Ice Hockey Skates', price: 7999, colors: ['black', 'silver'], sizes: sizeSets.skates, image: 1, tags: ['hockey', 'skates', 'ice'] },
    { brand: 'Warrior', name: 'Alpha Hockey Gloves', price: 2499, colors: ['black', 'red'], sizes: sizeSets.guardFit, image: 2, tags: ['hockey', 'gloves', 'protection'] },
    { brand: 'Sher-Wood', name: 'Practice Puck Set', price: 899, colors: ['black'], sizes: sizeSets.oneSize, image: 3, tags: ['hockey', 'puck', 'training'] },
    { brand: 'STX', name: 'Face Guard Helmet', price: 3199, colors: ['black', 'white'], sizes: sizeSets.guardFit, image: 2, tags: ['hockey', 'helmet', 'safety'] },
    { brand: 'Bauer', name: 'Goal Crease Leg Pads', price: 6899, colors: ['white', 'blue'], sizes: ['M', 'L'], image: 1, tags: ['hockey', 'leg-pads', 'goalie'] },
    { brand: 'CCM', name: 'Ribbed Practice Jersey', price: 1699, colors: ['red', 'white'], sizes: sizeSets.apparel, image: 2, tags: ['hockey', 'jersey', 'apparel'] },
    { brand: 'Warrior', name: 'Stick Tape Roll Pack', price: 349, colors: ['white', 'black'], sizes: sizeSets.oneSize, image: 0, tags: ['hockey', 'tape', 'basics'] },
    { brand: 'Bauer', name: 'Locker Room Gear Bag', price: 2899, colors: ['navy', 'black'], sizes: sizeSets.oneSize, image: 3, tags: ['hockey', 'bag', 'gear'] },
    { brand: 'STX', name: 'Shoulder Pad Lite', price: 3599, colors: ['black'], sizes: sizeSets.guardFit, image: 2, tags: ['hockey', 'shoulder-pad', 'protection'] },
    { brand: 'Sher-Wood', name: 'Skate Blade Guard Pair', price: 499, colors: ['blue'], sizes: sizeSets.oneSize, image: 1, tags: ['hockey', 'blade-guard', 'accessories'] },
    { brand: 'CCM', name: 'Training Agility Marker Pack', price: 649, colors: ['orange'], sizes: sizeSets.oneSize, image: 3, tags: ['hockey', 'markers', 'practice'] },
  ],
  Skating: [
    { brand: 'Rollerblade', name: 'Macroblade Fitness Inline Skates', price: 7499, colors: ['black', 'red'], sizes: sizeSets.skates, image: 0, tags: ['skating', 'inline-skates', 'fitness'] },
    { brand: 'K2', name: 'Urban Flow Inline Skates', price: 6999, colors: ['grey', 'lime'], sizes: sizeSets.skates, image: 1, tags: ['skating', 'inline-skates', 'urban'] },
    { brand: 'Bones', name: 'Street Park Helmet', price: 1599, colors: ['black', 'white'], sizes: sizeSets.guardFit, image: 3, tags: ['skating', 'helmet', 'safety'] },
    { brand: 'Impala', name: 'Retro Quad Skate Bag', price: 2199, colors: ['pink', 'black'], sizes: sizeSets.oneSize, image: 3, tags: ['skating', 'bag', 'gear'] },
    { brand: 'Riedell', name: 'Derby Knee Pad Set', price: 1899, colors: ['black'], sizes: sizeSets.guardFit, image: 2, tags: ['skating', 'knee-pads', 'protection'] },
    { brand: 'Bones', name: 'Speed Wheel 4-Pack', price: 1299, colors: ['white'], sizes: sizeSets.oneSize, image: 1, tags: ['skating', 'wheels', 'replacement'] },
    { brand: 'K2', name: 'Bearing Service Kit', price: 899, colors: ['silver'], sizes: sizeSets.oneSize, image: 1, tags: ['skating', 'bearings', 'maintenance'] },
    { brand: 'Rollerblade', name: 'Breathable Skate Socks', price: 649, colors: ['white', 'grey'], sizes: ['M', 'L'], image: 0, tags: ['skating', 'socks', 'basics'] },
    { brand: 'Impala', name: 'Protective Elbow Guard Set', price: 999, colors: ['lavender', 'black'], sizes: sizeSets.guardFit, image: 2, tags: ['skating', 'elbow-guard', 'safety'] },
    { brand: 'Riedell', name: 'Toe Stop Replacement Pair', price: 549, colors: ['red'], sizes: sizeSets.oneSize, image: 1, tags: ['skating', 'toe-stop', 'replacement'] },
    { brand: 'Bones', name: 'Portable Skate Tool', price: 459, colors: ['black'], sizes: sizeSets.oneSize, image: 3, tags: ['skating', 'tool', 'accessories'] },
    { brand: 'Rollerblade', name: 'Practice Marker Cone Set', price: 699, colors: ['orange'], sizes: sizeSets.oneSize, image: 3, tags: ['skating', 'cones', 'practice'] },
  ],
  Volleyball: [
    { brand: 'Mikasa', name: 'V200W Match Volleyball', price: 1899, colors: ['yellow', 'blue'], sizes: sizeSets.oneSize, image: 0, tags: ['volleyball', 'ball', 'match'] },
    { brand: 'Asics', name: 'Gel Rocket Court Shoes', price: 5599, colors: ['white', 'navy'], sizes: sizeSets.footwear, image: 1, tags: ['volleyball', 'shoes', 'court'] },
    { brand: 'Mizuno', name: 'Wave Momentum Court Shoes', price: 6499, colors: ['white', 'teal'], sizes: sizeSets.footwear, image: 1, tags: ['volleyball', 'shoes', 'indoor'] },
    { brand: 'Tachikara', name: 'Club Training Volleyball', price: 1399, colors: ['white', 'green'], sizes: sizeSets.oneSize, image: 0, tags: ['volleyball', 'ball', 'training'] },
    { brand: 'Molten', name: 'Attack Knee Pad Pair', price: 1199, colors: ['black'], sizes: sizeSets.guardFit, image: 2, tags: ['volleyball', 'knee-pads', 'protection'] },
    { brand: 'Asics', name: 'QuickDry Team Jersey', price: 1999, colors: ['royal', 'white'], sizes: sizeSets.apparel, image: 2, tags: ['volleyball', 'jersey', 'apparel'] },
    { brand: 'Mizuno', name: 'Stretch Match Shorts', price: 1499, colors: ['black', 'navy'], sizes: sizeSets.apparel, image: 2, tags: ['volleyball', 'shorts', 'basics'] },
    { brand: 'Tachikara', name: 'Portable Boundary Marker Set', price: 999, colors: ['yellow'], sizes: sizeSets.oneSize, image: 3, tags: ['volleyball', 'markers', 'practice'] },
    { brand: 'Mikasa', name: 'Court Side Duffel Bag', price: 2399, colors: ['black', 'blue'], sizes: sizeSets.oneSize, image: 3, tags: ['volleyball', 'bag', 'gear'] },
    { brand: 'Molten', name: 'Support Arm Sleeve Pair', price: 899, colors: ['white', 'black'], sizes: sizeSets.guardFit, image: 2, tags: ['volleyball', 'arm-sleeve', 'support'] },
    { brand: 'Mizuno', name: 'Low-Cut Performance Socks', price: 549, colors: ['white'], sizes: ['M', 'L'], image: 1, tags: ['volleyball', 'socks', 'essentials'] },
    { brand: 'Asics', name: 'Ankle Support Brace Set', price: 1299, colors: ['black'], sizes: sizeSets.guardFit, image: 2, tags: ['volleyball', 'ankle-brace', 'support'] },
  ],
};

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const buildDescription = (item, category) => {
  const tagLine = item.tags.slice(0, 3).join(', ');
  return `${item.brand} ${item.name} is a ${category.toLowerCase()} essential built for dependable comfort, durability, and everyday training. Ideal for players who want reliable ${tagLine} performance without overcomplicating their kit.`;
};

const generateSportsProducts = () => {
  const products = [];
  let id = 1;

  Object.entries(catalog).forEach(([category, items]) => {
    items.forEach((item, index) => {
      const imageGroup = imagePools[category];
      products.push({
        id: id++,
        slug: slugify(`${item.brand}-${item.name}`),
        name: `${item.brand} ${item.name}`,
        category,
        brand: item.brand,
        price: item.price,
        currency: 'INR',
        colors: item.colors,
        sizes: item.sizes,
        stock: stockPattern[index % stockPattern.length],
        imageUrl: imageGroup[item.image % imageGroup.length],
        description: buildDescription(item, category),
        tags: [...new Set([category.toLowerCase(), ...item.tags.map((tag) => tag.toLowerCase()), item.brand.toLowerCase(), 'sports'])],
        featured: index < 3,
      });
    });
  });

  return products;
};

const finalData = generateSportsProducts();
const outputPath = path.join(__dirname, '../../data/products.json');

if (!fs.existsSync(path.dirname(outputPath))) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
console.log(`Successfully generated ${finalData.length} sports essentials products.`);
