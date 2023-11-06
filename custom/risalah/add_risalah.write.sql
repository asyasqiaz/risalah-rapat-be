WITH ins_header AS (
    INSERT INTO risalah_rapat_header(perihal, periode, id_place, id_template, agenda, upload_template)
    VALUES ('{{.perihal}}', '{{.periode}}', '{{.id_place}}', '{{.id_template}}', '{{.agenda}}', '{{.upload_template}}')
    RETURNING id_risalah_header
),
ins_tracker AS (
  INSERT INTO risalah_trackers(user_internal, user_eksternal, jabatan, role, id_risalah_header, id_user) 
  VALUES ('{{.user_internal}}', '{{.user_eksternal}}', '{{.jabatan}}', '{{.role}}', (SELECT id_risalah_header FROM ins_header), '{{.id_user}}')
),
ins_doc AS (
    INSERT INTO risalah_relation_documents (nama_lampiran, file, id_risalah_header)
    SELECT '{{.nama_lampiran}}', '{{.file}}', (SELECT id_risalah_header FROM ins_header)
    WHERE NULLIF('{{.nama_lampiran}}', '') IS NOT NULL AND NULLIF('{{.file}}', '') IS NOT NULL
)
SELECT 'success' AS result
