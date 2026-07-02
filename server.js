const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, 'gym.db');

const dbExists = fs.existsSync(DB_PATH);
const db = new sqlite3.Database(DB_PATH, (error) => {
  if (error) {
    console.error('Gagal membuka database:', error.message);
    process.exit(1);
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

function initializeDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        photo TEXT,
        package TEXT,
        join_date TEXT,
        status TEXT
      )
    `);

    if (!dbExists) {
      const seed = db.prepare(
        'INSERT INTO members (id, name, photo, package, join_date, status) VALUES (?, ?, ?, ?, ?, ?)'
      );
      seed.run('010325', 'Abi', 'images/Abi.jpg', 'Gold', '2025-03-01', 'Aktif');
      seed.run('101020', 'Gibran', 'images/Gibran.jpg', 'Silver', '2020-10-10', 'Expired');
      seed.finalize();
    }
  });
}

initializeDatabase();

app.get('/api/members', (req, res) => {
  db.all('SELECT * FROM members ORDER BY name', (error, rows) => {
    if (error) {
      return res.status(500).json({ error: 'Gagal membaca data member.' });
    }
    res.json(rows);
  });
});

app.post('/api/members', (req, res) => {
  const { id, name, photo, package: pkg, join_date, status } = req.body;
  if (!id || !name || !join_date || !status) {
    return res.status(400).json({ error: 'Semua field harus diisi.' });
  }

  const query = 'INSERT INTO members (id, name, photo, package, join_date, status) VALUES (?, ?, ?, ?, ?, ?)';
  db.run(query, [id, name, photo, pkg, join_date, status], function (error) {
    if (error) {
      return res.status(500).json({ error: 'Gagal membuat member. ID mungkin sudah ada.' });
    }
    res.status(201).json({ id, name, photo, package: pkg, join_date, status });
  });
});

app.put('/api/members/:id', (req, res) => {
  const originalId = req.params.id;
  const { id, name, photo, package: pkg, join_date, status } = req.body;
  if (!id || !name || !join_date || !status) {
    return res.status(400).json({ error: 'Semua field harus diisi.' });
  }

  const query = `
    UPDATE members
    SET id = ?, name = ?, photo = ?, package = ?, join_date = ?, status = ?
    WHERE id = ?
  `;
  db.run(query, [id, name, photo, pkg, join_date, status, originalId], function (error) {
    if (error) {
      return res.status(500).json({ error: 'Gagal memperbarui member.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Member tidak ditemukan.' });
    }
    res.json({ id, name, photo, package: pkg, join_date, status });
  });
});

app.delete('/api/members/:id', (req, res) => {
  const memberId = req.params.id;
  db.run('DELETE FROM members WHERE id = ?', [memberId], function (error) {
    if (error) {
      return res.status(500).json({ error: 'Gagal menghapus member.' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Member tidak ditemukan.' });
    }
    res.json({ success: true });
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Rute tidak ditemukan.' });
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
