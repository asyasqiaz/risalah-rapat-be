const express = require("express");
const { Pool } = require("pg");
// const bcrypt = require("bcrypt");
// const { nanoid } = require("nanoid");
const bodyParser = require("body-parser");
const cors = require("cors"); // Import the cors middleware
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const axios = require('axios');

// const jwt = require('jsonwebtoken');
// const { expressjwt: expressJwt } = require('express-jwt');

// const jwtSecret = 'secret';  // Use the same secret as in Prest

// app.use(expressJwt({ secret: jwtSecret, algorithms: ['HS256'] }).unless({ path: ['/unprotected-route'] }));

// const invalidatedTokens = new Set();

// app.use((req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   if (!authHeader) {
//     return res.status(401).json({ error: 'Token tidak ditemukan' });
//   }

//   const token = authHeader.split(' ')[1];

//   if (invalidatedTokens.has(token)) {
//     return res.status(401).json({ error: 'Token tidak valid' });
//   }

//   jwt.verify(token, jwtSecret, (err) => {
//     if (err) {
//       return res.status(401).json({ error: 'Invalid or expired token' });
//     }
//     next();
//   });

// })
// app.use((err, req, res, next) => {
//   if (err.name === 'UnauthorizedError') {
//     res.status(401).json({ error: 'Invalid or expired token' });
//   }
// });


app.use(cors()); // Use the cors middleware
const port = process.env.PORT || 3010;
// Create a PostgreSQL connection pool
const pool = new Pool({
  user: "prest",
  host: "localhost",
  database: "prest",
  password: "prest",
  port: 5435, // Replace with your PostgreSQL port
});
// Middleware to parse JSON and urlencoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadFolder = 'uploads/';

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

// Multer middleware untuk mengunggah file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    // const fileName = Date.now() + path.extname(file.originalname);
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });
app.use(express.json());

app.post('/_QUERIES/templates/add_template', upload.single('attachment'), async (req, res) => {
  const { attachmentTitle, status } = req.body;
  const attachment = req.file.path;
  try {
    const client = await pool.connect();
    await client.query('BEGIN');
    // Masukkan data dokumen relasi ke dalam tabel relation-documents
    const insertDocumentQuery = 'INSERT INTO risalah_templates (nama_template, file, status) VALUES ($1, $2, $3)';
    await client.query(insertDocumentQuery, [attachmentTitle, attachment, status]);
    await client.query('COMMIT');
    client.release();
    res.status(201).json({ message: 'Template added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/_QUERIES/templates/patch_template', upload.single('attachment'), async (req, res) => {
  const templateId = req.params.id;
  const { attachmentTitle, status } = req.body;
  const attachment = req.file.path;

  try {
    const client = await pool.connect();
    await client.query('BEGIN');

    // Periksa apakah template dengan ID tertentu ada
    const checkTemplateQuery = 'SELECT * FROM template WHERE id = $1';
    const checkTemplateResult = await client.query(checkTemplateQuery, [templateId]);

    if (checkTemplateResult.rows.length === 0) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    // Update data template berdasarkan ID
    const updateTemplateQuery = 'UPDATE template SET title = $1, file = $2, status = $3 WHERE id = $4';
    await client.query(updateTemplateQuery, [attachmentTitle, attachment, status, templateId]);

    await client.query('COMMIT');
    client.release();

    res.status(200).json({ message: 'Template updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/relation-documents', upload.array('attachment'), async (req, res) => {
  const { attachmentName } = req.body;
  const attachment = req.file.path;
  try {
    const client = await pool.connect();
    await client.query('BEGIN');
    // Masukkan data dokumen relasi ke dalam tabel relation-documents
    const insertDocumentQuery = 'INSERT INTO relation_documents (name, file) VALUES ($1, $2)';
    await client.query(insertDocumentQuery, [attachmentName, attachment]);
    await client.query('COMMIT');
    client.release();
    res.status(201).json({ message: 'Relation document added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// app.post('/risalah', upload.single('attachment'), async (req, res) => {

//   try {
//     const {
//       perihal, periode, id_place, id_template, agenda,
//       user_internal, user_eksternal, jabatan, role, id_user,
//       nama_lampiran, file
//     } = req.body;
//     const attachment = req.file.path;

//     const query = `
//             WITH ins_header AS (
//                 INSERT INTO risalah_rapat_header(perihal, periode, id_place, id_template, agenda, upload_template)
//                 VALUES ($1, $2, $3, $4, $5, $6)
//                 RETURNING id_risalah_header
//             ),
//             ins_tracker AS (
//                 INSERT INTO risalah_trackers(user_internal, user_eksternal, jabatan, role, id_risalah_header, id_user) 
//                 VALUES ($7, $8, $9, $10, (SELECT id_risalah_header FROM ins_header), $11)
//             ),
//             ins_doc AS (
//                 INSERT INTO risalah_relation_documents (nama_lampiran, file, id_risalah_header)
//                 SELECT $12, $13, (SELECT id_risalah_header FROM ins_header)
//                 WHERE NULLIF($12, '') IS NOT NULL AND NULLIF($13, '') IS NOT NULL
//             )
//             SELECT 'success' AS result;
//         `;

//     const result = await pool.query(query, [
//       perihal, periode, id_place, id_template, agenda, attachment,
//       user_internal, user_eksternal, jabatan, role, id_user,
//       nama_lampiran, file
//     ]);

//     res.status(200).json(result.rows[0]);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });


app.post('/_QUERIES/risalah/add_risalah', upload.fields([{ name: 'upload_template', maxCount: 1 }, { name: 'files', maxCount: 10 }]), async (req, res) => {
  try {
    let {
      perihal, periode, id_place, id_template, agenda,
      trackers, relation_documents
    } = req.body;

    if (typeof trackers === 'string') {
      trackers = JSON.parse(trackers);
    }

    // const templateAttachment = req.file.path;
    const uploadTemplate = req.files['upload_template'][0].path;

    // Begin a transaction
    await pool.query('BEGIN');

    const headerResult = await pool.query(
      `INSERT INTO risalah_rapat_header(perihal, periode, id_place, id_template, agenda, upload_template)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id_risalah_header`,
      [perihal, periode, id_place, id_template, agenda, uploadTemplate]
    );

    const id_risalah_header = headerResult.rows[0].id_risalah_header;

    for (const tracker of trackers) {
      const { user_internal, user_eksternal, jabatan, id_user, role } = tracker;

      await pool.query(
        `INSERT INTO risalah_trackers(user_internal, user_eksternal, jabatan, role, id_user, id_risalah_header)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
        [user_internal, user_eksternal, jabatan, role, id_user, id_risalah_header]
      );
    }

    if (relation_documents) {
      for (const item of relation_documents) {
        const file = req.files['files'][item.fileIndex].path;
        await pool.query(
          `INSERT INTO risalah_relation_documents (nama_lampiran, file, id_risalah_header)
                 VALUES ($1, $2, $3)`,
          [item.attachmentName, file, id_risalah_header]
        );
      }
    }

    // Commit the transaction
    await pool.query('COMMIT');

    res.status(200).json({ result: 'success' });
  } catch (error) {
    // Rollback the transaction in case of error
    await pool.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});