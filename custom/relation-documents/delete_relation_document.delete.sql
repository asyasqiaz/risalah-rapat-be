DELETE FROM risalah_relation_documents 
WHERE id_relation_document = '{{.id_relation_document}}'
RETURNING id_relation_document