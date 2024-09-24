document.getElementById('image-upload').addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.getElementById('image-preview');
                    img.src = e.target.result;
                    img.style.display = 'block';
                }
                reader.readAsDataURL(file);
            }
        });

        document.getElementById('send-button').addEventListener('click', async function() {
            const input = document.getElementById('user-input').value;
            const fileInput = document.getElementById('image-upload');
            const formData = new FormData();

            if (fileInput.files.length > 0) {
                formData.append('file', fileInput.files[0]);
                await fetch('/upload_image/', {
                    method: 'POST',
                    body: formData
                });
            }

            const response = await fetch('/process_message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt: input })
            });

            const responseText = await response.text();
            document.getElementById('messages').innerHTML += `<div>${responseText}</div>`;
            document.getElementById('user-input').value = '';
            fileInput.value = '';
            document.getElementById('image-preview').style.display = 'none';
        });
