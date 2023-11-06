BEGIN TRANSACTION

UPDATE risalah_trackers 
SET flag_approve = 'Y' AND approve_date = NOW() 
WHERE id_tracker = {{.id_tracker}} AND id_risalah_header = {{.id_risalah_header}}

COMMIT

ROLLBACK