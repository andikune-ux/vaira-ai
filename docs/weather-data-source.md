# Sumber Data Cuaca Beranda

Kartu cuaca menggunakan dokumentasi resmi Open-Meteo: https://open-meteo.com/en/docs.

Endpoint forecast menerima koordinat WGS84 `latitude` dan `longitude`. Implementasi meminta data saat ini melalui parameter `current=temperature_2m,apparent_temperature,weather_code` dan zona waktu otomatis melalui `timezone=auto`. Nilai suhu dikembalikan dalam derajat Celsius ketika memakai unit metrik bawaan.

Data cuaca dipakai sebagai informasi kondisi saat ini, bukan peringatan keselamatan atau prediksi yang dijamin.
