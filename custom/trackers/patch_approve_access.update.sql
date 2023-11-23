WITH nomor_urut_temp AS (
  SELECT nomor_urut FROM risalah_trackers 
    WHERE id_risalah_header = {{.id_risalah_header}} AND id_user = {{.id_user}} AND flag_open = 'Y'
)

UPDATE risalah_trackers
SET flag_approve = 'Y', approve_date = NOW() 
WHERE id_risalah_header = {{.id_risalah_header}}
  AND id_user = {{.id_user}}
  AND nomor_urut = (SELECT * FROM nomor_urut_temp) - 1