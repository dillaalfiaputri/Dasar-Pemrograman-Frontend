function loadData() {
    // Buat objek XMLHttpRequest
    var xhr = new XMLHttpRequest();

    // Tentukan metode dan URL
    xhr.open('GET', 'data.json', true);

    // Ketika permintaan berhasil
    xhr.onload = function() {
        if (xhr.status === 200) {
            var data = JSON.parse(xhr.responseText);
            var output = '<ul>';
            data.forEach(function(mahasiswa) {
                output += '<li>' + mahasiswa.nama + ' - ' + mahasiswa.nim + '</li>';
            });
            output += '</ul>';
            document.getElementById('hasil').innerHTML = output;
        } else {
            document.getElementById('hasil').innerHTML = 'Terjadi kesalahan saat mengambil data.';
        }
    };

        // Kirim permintaan
        xhr.send();
}