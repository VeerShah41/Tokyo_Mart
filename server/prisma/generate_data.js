const fs = require('fs');
const path = require('path');

const brands = {
    'Basketball': ['Nike', 'Jordan', 'Spalding', 'Under Armour', 'Wilson'],
    'Football': ['Adidas', 'Nike', 'Puma', 'Umbro', 'Under Armour'],
    'Hockey': ['Bauer', 'CCM', 'Warrior', 'STX', 'Sher-Wood'],
    'Skating': ['Rollerblade', 'K2', 'Riedell', 'Impala', 'Bones'],
    'Volleyball': ['Mikasa', 'Tachikara', 'Mizuno', 'Asics', 'Molten']
};

const images = {
    'Basketball': [
        'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1542652694-40abf526446e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&w=800&q=80'
    ],
    'Football': [
        'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1508344928928-7137b67de192?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1624880357913-a8539b0625ce?auto=format&fit=crop&w=800&q=80'
    ],
    'Hockey': [
        'https://images.unsplash.com/photo-1580748141549-71748dbe0bdc?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1515703407324-5f753eed20b1?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1563604071375-38501235bd2e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1543326727-cf6c39f851eb?auto=format&fit=crop&w=800&q=80'
    ],
    'Skating': [
        'https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1493630656041-5cba89710f64?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1510411652410-b98ac149ba75?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1564982752979-3f7cb9b88731?auto=format&fit=crop&w=800&q=80'
    ],
    'Volleyball': [
        'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1593786270032-441f7e914044?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&w=800&q=80'
    ]
};

const productTypes = {
    'Basketball': ['Pro Basketball', 'High-Top Sneakers', 'Player Jersey', 'Training Shorts'],
    'Football': ['Match Ball', 'Turf Cleats', 'Shin Guards', 'Goalkeeper Gloves'],
    'Hockey': ['Composite Stick', 'Ice Skates', 'Protective Helmet', 'Training Puck Set'],
    'Skating': ['Inline Skates', 'Pro Skateboard', 'Knee Pads', 'Helmet'],
    'Volleyball': ['Beach Volleyball', 'Court Shoes', 'Knee Pads', 'Spandex Shorts']
};

const allColors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'grey', 'orange'];
const apparelSizes = ['S', 'M', 'L', 'XL', 'XXL'];
const shoeSizes = ['7', '8', '9', '10', '11', '12'];
const equipSizes = ['one-size', 'Standard'];

const generateSportsProducts = () => {
    const products = [];
    let idCounter = 1;

    const categories = ['Basketball', 'Football', 'Hockey', 'Skating', 'Volleyball'];

    categories.forEach((cat) => {
        // We want exactly 20 items per category to reach 100
        for (let i = 0; i < 20; i++) {
            const brandGroup = brands[cat];
            const brand = brandGroup[i % brandGroup.length];
            
            const types = productTypes[cat];
            const type = types[i % types.length];

            const name = `${brand} ${type} Elite ${Math.floor(Math.random() * 900) + 100}`;
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

            let sizes = [];
            let price = 0;
            
            if (type.includes('Sneakers') || type.includes('Cleats') || type.includes('Skates') || type.includes('Shoes')) {
                sizes = shoeSizes;
                price = Math.floor(Math.random() * 8000) + 3000;
            } else if (type.includes('Jersey') || type.includes('Shorts')) {
                sizes = apparelSizes;
                price = Math.floor(Math.random() * 3000) + 1000;
            } else {
                sizes = equipSizes;
                price = Math.floor(Math.random() * 4000) + 500;
            }

            // Pick 2 random colors for options
            const colors = [
                allColors[Math.floor(Math.random() * allColors.length)],
                allColors[Math.floor(Math.random() * allColors.length)]
            ];
            // ensure unique colors
            const uniqueColors = [...new Set(colors)];

            const imgGroup = images[cat];
            const imageUrl = imgGroup[i % imgGroup.length];

            products.push({
                id: idCounter++,
                slug: slug,
                name: name,
                category: cat,
                brand: brand,
                price: price,
                currency: 'INR',
                colors: uniqueColors,
                sizes: sizes,
                stock: Math.floor(Math.random() * 100) + 5,
                imageUrl: imageUrl,
                description: `Experience top-tier performance with the ${name}. Engineered by ${brand} for maximum durability, comfort, and results in ${cat.toLowerCase()}. Comes in multiple colors and sizes to fit your exact needs.`,
                tags: [cat.toLowerCase(), brand.toLowerCase(), 'sports', 'professional', type.split(' ')[1]?.toLowerCase() || type.toLowerCase()],
                featured: i < 3 // first 3 of each category are featured
            });
        }
    });

    return products;
};

const finalData = generateSportsProducts();
const outputPath = path.join(__dirname, '../../data/products.json');

// Ensure data dir exists
if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
console.log(`Successfully generated ${finalData.length} premium sports products!`);
