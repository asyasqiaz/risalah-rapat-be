INSERT INTO risalah_relation_documents (nama_lampiran, file, id_risalah_header) 
VALUES ('{{.nama_lampiran}}', '{{.file}}', '{{.id_risalah_header}}')
RETURNING id_relation_document
