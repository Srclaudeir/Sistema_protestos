USE protestos_db;
UPDATE usuarios SET password=''$2a$12$HzE5NgyM549w71HP7zBpm.Uu8QoEZ.W5y3TLQUZ51Mv4Xil5EHQUy'' WHERE username=''admin'';
SELECT username,password FROM usuarios WHERE username=''admin'';
