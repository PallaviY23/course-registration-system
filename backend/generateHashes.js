const bcrypt = require('bcryptjs');

// Define test users with their passwords
const testUsers = [
  { username: 'admin', password: 'admin123' },
  { username: 'Arnab', password: 'prof123' },
  { username: 'ritwijb', password: 'prof123' },
  { username: 'vinaykg', password: 'prof123' },
  { username: 'durbasmriti', password: 'student123' },
  { username: 'rpallavi', password: 'student123' },
  { username: 'jyothika', password: 'student123' },
  { username: 'aayushman', password: 'student123' },
  { username: 'bob', password: 'student123' }
];

// Generate hashes
async function generateHashes() {
  console.log('Bcrypt hashes for test users:\n');
  console.log('Username\t\tPassword\t\tHash');
  console.log('--------\t\t--------\t\t----');
  
  for (const user of testUsers) {
    const hash = await bcrypt.hash(user.password, 10);
    console.log(`${user.username}\t\t${user.password}\t\t${hash}`);
  }
}

generateHashes();
