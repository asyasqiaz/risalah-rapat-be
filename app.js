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


app.use(cors());
const port = process.env.PORT || 3010;
const pool = new Pool({
  user: "prest",
  host: "localhost",
  database: "prest",
  password: "prest",
  port: 5435,
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadFolder = 'uploads/';

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    // const fileName = Date.now() + path.extname(file.originalname);
    cb(null, path.basename(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Check if the file type is allowed
  if (file.mimetype === 'application/msword' ||          // for .doc
    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || // for .docx
    file.mimetype === 'application/pdf') {             // for .pdf
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Invalid file format. Allowed formats: .doc, .docx, .pdf'), false);
  }
};

const maxFileSize = 2 * 1024 * 1024; // 2 MB

const upload = multer({ storage, fileFilter, limits: { fileSize: maxFileSize }, });
app.use(express.json());

app.get('/_QUERIES/users/get_user_by_session/:token', async (req, res) => {
  const token = req.params.token;

  try {
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const results = await pool.query(`SELECT * FROM risalah_users WHERE token = $1`, [token]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(results.rows[0]);
  }
  catch (err) {
    console.error('Error executing the query:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/_QUERIES/templates/add_template', upload.single('attachment'), async (req, res) => {
  const { attachmentTitle, status, created_by, modified_by } = req.body;
  const attachment = path.basename(req.file.path);
  try {
    // const client = await pool.connect();
    // await client.query('BEGIN');

    const insertDocumentQuery = 'INSERT INTO risalah_templates (nama_template, file, status, created_by, modified_by) VALUES ($1, $2, $3, $4, $5)';
    await pool.query(insertDocumentQuery, [attachmentTitle, attachment, status, created_by, modified_by]);
    // await client.query('COMMIT');
    // client.release();
    res.status(201).json({ message: 'Template added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.patch('/_QUERIES/templates/patch_template/:id_template', upload.single('attachment'), async (req, res) => {
  const templateId = req.params.id_template;
  const { attachmentTitle, status, modified_by } = req.body;
  const attachment = path.basename(req.file.path);

  try {
    // const client = await pool.connect();
    // await client.query('BEGIN');

    const checkTemplateQuery = 'SELECT * FROM risalah_templates WHERE id_template = $1';
    const checkTemplateResult = await pool.query(checkTemplateQuery, [templateId]);

    if (checkTemplateResult.rows.length === 0) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }

    // Update data template berdasarkan ID
    const updateTemplateQuery = 'UPDATE risalah_templates SET nama_template = $1, file = $2, status = $3, modified_by = $4, modified_date = now() WHERE id_template = $5';
    await pool.query(updateTemplateQuery, [attachmentTitle, attachment, status, modified_by, templateId]);

    // await client.query('COMMIT');
    // client.release();

    res.status(200).json({ message: 'Template updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// app.get('/_QUERIES/templates/get_template/:id_template', async (req, res) => {
//   const templateId = req.params.id_template;

//   try {
//     const templateQuery = 'SELECT * FROM template WHERE id = $1';
//     const { rows } = await pool.query(templateQuery, [templateId]);

//     if (rows.length === 0) {
//       res.status(404).json({ error: 'Template not found' });
//     } else {
//       const template = rows[0];
//       res.status(200).json(template);
//     }

//     client.release();
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

app.get('/_QUERIES/templates/get_template/:file', async (req, res) => {
  const templateName = req.params.file;

  try {
    const getTemplateQuery = 'SELECT * FROM risalah_templates WHERE file = $1';
    const { rows } = await pool.query(getTemplateQuery, [templateName]);

    if (rows.length === 0) {
      res.status(404).json({ error: 'Template not found' });
    } else {
      const template = rows[0];
      const templateFilePath = path.join(uploadFolder, template.file);

      // Check if the file exists
      if (!fs.existsSync(templateFilePath)) {
        res.status(404).json({ error: 'Template file not found' });
        return;
      }

      // Set the response headers to specify the file as an attachment
      res.setHeader('Content-Disposition', `attachment; filename=${template.file}`);

      // Send the file using res.download
      res.download(templateFilePath, (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Error downloading template file' });
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// app.post('/relation-documents', upload.array('attachment'), async (req, res) => {
//   const { attachmentName } = req.body;
//   const attachment = req.file.path;
//   try {
//     const client = await pool.connect();
//     await client.query('BEGIN');
//     // Masukkan data dokumen relasi ke dalam tabel relation-documents
//     const insertDocumentQuery = 'INSERT INTO relation_documents (name, file) VALUES ($1, $2)';
//     await client.query(insertDocumentQuery, [attachmentName, attachment]);
//     await client.query('COMMIT');
//     client.release();
//     res.status(201).json({ message: 'Relation document added successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

app.get('/_QUERIES/relation-documents/get_relation_document/:file', async (req, res) => {
  const relationDocumentName = req.params.file;

  try {
    const getRelationDocumentQuery = 'SELECT * FROM risalah_relation_documents WHERE file = $1';
    const { rows } = await pool.query(getRelationDocumentQuery, [relationDocumentName]);

    if (rows.length === 0) {
      res.status(404).json({ error: 'Relation document not found' });
    } else {
      const relationDocument = rows[0];
      const relationDocumentFilePath = path.join(uploadFolder, relationDocument.file);

      // Check if the file exists
      if (!fs.existsSync(relationDocumentFilePath)) {
        res.status(404).json({ error: 'Relation document file not found' });
        return;
      }

      // Set the response headers to specify the file as an attachment
      res.setHeader('Content-Disposition', `attachment; filename=${relationDocument.file}`);

      // Send the file using res.download
      res.download(relationDocumentFilePath, (err) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Error downloading relation document file' });
        }
      });
    }
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

app.post('/_QUERIES/risalah/add_risalah', upload.fields([{ name: 'upload_template', maxCount: 1 }, { name: 'relation_documents', maxCount: 10 }]), async (req, res) => {
  try {
    let {
      perihal, periode, id_place, id_template, agenda,
      trackers, created_by, modified_by
    } = req.body;

    if (typeof trackers === 'string') {
      trackers = JSON.parse(trackers);
    }

    const uploadTemplate = req.files['upload_template'][0].path;
    const uploadTemplateName = path.basename(uploadTemplate);

    // Begin a transaction
    await pool.query('BEGIN');

    const headerResult = await pool.query(
      `INSERT INTO risalah_rapat_header(perihal, periode, id_place, id_template, agenda, upload_template, created_by, modified_by)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING id_risalah_header`,
      [perihal, periode, id_place, id_template, agenda, uploadTemplateName, created_by, modified_by]
    );

    const id_risalah_header = headerResult.rows[0].id_risalah_header;

    for (const tracker of trackers) {
      const { user_internal, user_eksternal, jabatan, id_user, role } = tracker;

      await pool.query(
        `INSERT INTO risalah_trackers(user_internal, user_eksternal, jabatan, role, id_user, id_risalah_header, created_by, modified_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [user_internal, user_eksternal, jabatan, role, id_user, id_risalah_header, created_by, modified_by]
      );
    }

    const relationDocuments = req.files['relation_documents'];

    if (relationDocuments) {
      const relationDocumentPaths = relationDocuments.map(file => file.path);

      for (const relationDocumentPath of relationDocumentPaths) {
        const documentFileName = path.basename(relationDocumentPath);

        await pool.query(
          `INSERT INTO risalah_relation_documents(id_risalah_header, file, created_by, modified_by)
            VALUES ($1, $2, $3, $4)`,
          [id_risalah_header, documentFileName, created_by, modified_by]
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

app.patch('/_QUERIES/risalah/patch_risalah/:id_risalah_header', upload.fields([{ name: 'upload_template', maxCount: 1 }, { name: 'relation_documents', maxCount: 10 }]), async (req, res) => {
  const risalahId = req.params.id_risalah_header;

  try {
    let {
      perihal, periode, id_place, id_template, agenda,
      trackers, modified_by
    } = req.body;

    if (typeof trackers === 'string') {
      trackers = JSON.parse(trackers);
    }

    const uploadTemplate = req.files['upload_template'][0].path;
    const uploadTemplateName = path.basename(uploadTemplate);

    // Begin a transaction
    await pool.query('BEGIN');

    // Update the 'risalah_rapat_header' record
    await pool.query(
      `UPDATE risalah_rapat_header
       SET perihal = $1, periode = $2, id_place = $3, id_template = $4, agenda = $5, upload_template = $6, modified_by = $7
       WHERE id_risalah_header = $8`,
      [perihal, periode, id_place, id_template, agenda, uploadTemplateName, modified_by, risalahId]
    );

    // Update 'risalah_trackers' records
    for (const tracker of trackers) {
      const { user_internal, user_eksternal, jabatan, id_user, role } = tracker;

      await pool.query(
        `UPDATE risalah_trackers
         SET user_internal = $1, user_eksternal = $2, jabatan = $3, role = $4, id_user = $5, modified_by = $6
         WHERE id_risalah_header = $7 AND id_tracker = $8`,
        [user_internal, user_eksternal, jabatan, role, id_user, modified_by, risalahId, tracker.id_tracker]
      );
    }

    // Delete existing 'risalah_relation_documents' records for the given id_risalah_header
    await pool.query(
      `DELETE FROM risalah_relation_documents
       WHERE id_risalah_header = $1`,
      [risalahId]
    );

    // Insert 'risalah_relation_documents' records for the updated information
    const relationDocuments = req.files['relation_documents'];

    if (relationDocuments) {
      const relationDocumentPaths = relationDocuments.map(file => file.path);

      for (const relationDocumentPath of relationDocumentPaths) {
        const documentFileName = path.basename(relationDocumentPath);

        await pool.query(
          `INSERT INTO risalah_relation_documents (id_risalah_header, file, modified_by)
           VALUES ($1, $2, $3)`,
          [risalahId, documentFileName, modified_by]
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