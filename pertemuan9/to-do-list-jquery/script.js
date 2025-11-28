    $(document).ready(function() {
        $("#addBtn").click(function() {
            let taskText = $("#taskInput").val().trim();

            // Validasi: tidak boleh kosong
            if (taskText === "") {
                alert("Tugas tidak boleh kosong!");
                return;
            }

            // Buat elemen <li> baru
            let li = $("<li></li>").text(taskText);

            // Tombol hapus
            let deleteBtn = $("<button class='delete-btn'>Hapus</button>");

            // Tambahkan tombol hapus ke li
            li.append(deleteBtn);

            // Tambahkan item ke daftar
            $("#taskList").append(li);

            // Bersihkan input
            $("#taskInput").val("");
        });

        // Delegasi event: tandai selesai saat diklik
        $("#taskList").on("click", "li", function() {
            $(this).toggleClass("task-done");
        });

        // Delegasi event: hapus item saat tombol hapus diklik
        $("#taskList").on("click", ".delete-btn", function(event) {
            event.stopPropagation(); // mencegah klik li
            $(this).parent().fadeOut(300, function() {
                $(this).remove();
            });
        });
    });