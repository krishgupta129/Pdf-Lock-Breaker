document.getElementById('pdfForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const fileInput = document.getElementById('pdfFile');
  const digits = document.getElementById('digits').value;
  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const currentComboText = document.getElementById('currentCombo');
  const resultDiv = document.getElementById('result');
  const downloadBtn = document.getElementById('downloadLink');
  const controls = document.getElementById('controls');
  const pauseBtn = document.getElementById('pauseBtn');
  const stopBtn = document.getElementById('stopBtn');

  progressContainer.classList.remove('hidden');
  controls.classList.remove('hidden');
  resultDiv.textContent = '';
  downloadBtn.classList.add('disabled');
  downloadBtn.href = "#";
  downloadBtn.setAttribute("disabled", "true");

  currentComboText.textContent = '';
  progressText.textContent = 'Starting...';

  let paused = false;

  pauseBtn.textContent = "Pause";
  pauseBtn.onclick = async () => {
    if (!paused) {
      await fetch('/pause', { method: 'POST' });
      pauseBtn.textContent = "Resume";
      paused = true;
    } else {
      await fetch('/resume', { method: 'POST' });
      pauseBtn.textContent = "Pause";
      paused = false;
    }
  };

  stopBtn.onclick = async () => {
    await fetch('/stop', { method: 'POST' });
    location.reload(); // Reload to reset
  };

  const formData = new FormData();
  formData.append('pdf', fileInput.files[0]);
  formData.append('digits', digits);

  const response = await fetch('/brute-force', {
    method: 'POST',
    body: formData
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');

    for (let line of lines) {
      if (line.includes('progress:')) {
        const match = line.match(/progress:(\d+)\/(\d+)\|current:(\d+)\|status:(.*)/);
        if (match) {
          const done = parseInt(match[1]);
          const total = parseInt(match[2]);
          const current = match[3];
          const status = match[4];

          const percent = Math.floor((done / total) * 100);
          progressBar.value = percent;
          progressText.textContent = `Progress: ${percent}% (${done}/${total})`;
          currentComboText.textContent = `Trying: ${current}`;

          if (status.startsWith("found")) {
            resultDiv.innerText = `✅ Password Found: ${status.split(":")[1]}`;

            downloadBtn.href = "/download";
            downloadBtn.classList.remove("disabled");
            downloadBtn.removeAttribute("disabled");
          }
        }
      } else if (line.startsWith("status:done")) {
        resultDiv.innerText = "❌ " + line.split(":")[2];
        currentComboText.textContent = '';
      } else if (line.startsWith("status:error")) {
        resultDiv.innerText = "⚠️ Error: " + line.split(":")[2];
        currentComboText.textContent = '';
      }
    }
  }
});
