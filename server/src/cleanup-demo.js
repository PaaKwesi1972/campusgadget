import pool from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const DEMO_EMAILS = [
  'ama.boateng.demo@st.ug.edu.gh',
  'kwame.owusu.demo@st.ug.edu.gh',
  'efua.mensah.demo@st.ug.edu.gh',
  'yaw.darko.demo@st.ug.edu.gh',
];

async function cleanup() {
  console.log('Removing demo sellers and their listings...');

  const result = await pool.query(
    'DELETE FROM users WHERE email = ANY($1::text[]) RETURNING full_name, email',
    [DEMO_EMAILS]
  );

  if (result.rows.length === 0) {
    console.log('No demo accounts found — nothing to remove.');
  } else {
    result.rows.forEach(function (u) {
      console.log('Removed: ' + u.full_name + ' (' + u.email + ')');
    });
  }

  console.log('Cleanup complete. Their listings were removed automatically along with them.');
  process.exit(0);
}

cleanup().catch(function (err) {
  console.error('CLEANUP ERROR:', err.message);
  process.exit(1);
});

