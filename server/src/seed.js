import bcrypt from 'bcryptjs';
import pool from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const SELLERS = [
  { fullName: 'Ama Boateng', email: 'ama.boateng.demo@st.ug.edu.gh', password: 'DemoPass123' },
  { fullName: 'Kwame Owusu', email: 'kwame.owusu.demo@st.ug.edu.gh', password: 'DemoPass123' },
  { fullName: 'Efua Mensah', email: 'efua.mensah.demo@st.ug.edu.gh', password: 'DemoPass123' },
  { fullName: 'Yaw Darko', email: 'yaw.darko.demo@st.ug.edu.gh', password: 'DemoPass123' },
];

const LISTINGS = [
  { title: 'MacBook Air M1, 256GB', price: 4200, category: 'Laptops', condition: 'Good', description: 'Barely used, always kept in a sleeve. Battery health 92%. Comes with original charger.', keyword: 'macbook', seed: 1 },
  { title: 'iPhone 13, 128GB', price: 3600, category: 'Phones', condition: 'Like New', description: 'Excellent condition, no scratches, screen protector on since day one. Battery health 89%.', keyword: 'iphone', seed: 2 },
  { title: 'iPad 9th Gen, 64GB', price: 2100, category: 'Tablets', condition: 'Fair', description: 'Some light scratches on the back, screen is perfect. Great for note-taking and reading.', keyword: 'ipad,tablet', seed: 3 },
  { title: 'AirPods Pro 2', price: 950, category: 'Audio', condition: 'Like New', description: 'Used for about 2 months. Both earbuds and case in perfect condition.', keyword: 'earbuds,wireless', seed: 4 },
  { title: 'Samsung Galaxy Tab A8', price: 1450, category: 'Tablets', condition: 'Like New', description: 'Purchased last semester, barely used since I got a laptop. Comes with charger and case.', keyword: 'tablet,android', seed: 5 },
  { title: 'Gaming Mouse (RGB)', price: 150, category: 'Accessories', condition: 'Good', description: 'RGB gaming mouse, works perfectly. Slight wear on the side grips but fully functional.', keyword: 'gamingmouse,mouse', seed: 6 },
  { title: 'PS5 Controller', price: 380, category: 'Accessories', condition: 'Fair', description: 'Sticks are in good condition, no drift. Some cosmetic scratches on the back panel.', keyword: 'gamecontroller,playstation', seed: 7 },
  { title: 'Bluetooth Speaker', price: 220, category: 'Audio', condition: 'Good', description: 'Great sound quality, battery lasts about 8 hours per charge. Minor scuff on the bottom.', keyword: 'speaker,bluetooth', seed: 8 },
  { title: 'Anker 20W Charger', price: 85, category: 'Accessories', condition: 'New', description: 'Brand new, still sealed. Bought two by mistake. Fast-charges iPhone and most Android phones.', keyword: 'charger,usb', seed: 9 },
  { title: 'Laptop Sleeve 13"', price: 120, category: 'Accessories', condition: 'Like New', description: 'Used for one semester, no visible wear. Fits any 13-inch laptop snugly.', keyword: 'laptopbag,sleeve', seed: 10 },
  { title: 'Wired Earphones', price: 40, category: 'Audio', condition: 'New', description: 'Unopened, still in original packaging. Standard 3.5mm jack with in-line mic.', keyword: 'earphones,headphones', seed: 11 },
  { title: 'Phone Case (iPhone 12)', price: 60, category: 'Accessories', condition: 'New', description: 'Never used, wrong size ordered by mistake. Clear case with reinforced corners.', keyword: 'phonecase', seed: 12 },
];

async function seed() {
  console.log('Seeding demo sellers and listings...');

  const sellerIds = [];

  for (const seller of SELLERS) {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [seller.email]);
    if (existing.rows.length > 0) {
      sellerIds.push(existing.rows[0].id);
      console.log('Already exists: ' + seller.fullName);
      continue;
    }

    const passwordHash = await bcrypt.hash(seller.password, 10);
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, user_type, is_verified)
       VALUES ($1, $2, $3, 'student', true)
       RETURNING id`,
      [seller.fullName, seller.email, passwordHash]
    );
    sellerIds.push(result.rows[0].id);
    console.log('Created seller: ' + seller.fullName);
  }

  // Clear out the previous demo listings so we don't end up with duplicates
  await pool.query(
    `DELETE FROM listings WHERE seller_id = ANY($1::int[])`,
    [sellerIds]
  );
  console.log('Cleared previous demo listings.');

  for (let i = 0; i < LISTINGS.length; i++) {
    const listing = LISTINGS[i];
    const sellerId = sellerIds[i % sellerIds.length];
    const imageUrl = 'https://loremflickr.com/700/700/' + listing.keyword + '?lock=' + listing.seed;

    await pool.query(
      `INSERT INTO listings (seller_id, title, description, price, category, condition, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [sellerId, listing.title, listing.description, listing.price, listing.category, listing.condition, imageUrl]
    );
    console.log('Created listing: ' + listing.title);
  }

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch(function (err) {
  console.error('SEED ERROR:', err.message);
  process.exit(1);
});
