SELECT nomor_urut 
FROM risalah_trackers 
WHERE id_risalah_header = {{.id_risalah_header}} 
AND id_user = {{.id_user}}
AND flag_open = 'Y'