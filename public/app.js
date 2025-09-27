const form = document.getElementById('uploadForm');
const imageInput = document.getElementById('imageInput');
const rasterPreview = document.getElementById('rasterPreview');
const svgOut = document.getElementById('svgOut');
const status = document.getElementById('status');
const downloadSvg = document.getElementById('downloadSvg');
const tolerance = document.getElementById('tolerance');

imageInput.addEventListener('change', (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  rasterPreview.src = URL.createObjectURL(file);
  svgOut.innerHTML = '';
  downloadSvg.style.display = 'none';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = imageInput.files && imageInput.files[0];
  if (!file) return alert('Please select an image');

  status.textContent = 'Uploading and vectorizing...';

  const fd = new FormData();
  fd.append('image', file);

  try {
    const resp = await fetch('https://vectorizee.onrender.com/api/vectorize', {
  method: 'POST',
  body: fd
});

    if (!resp.ok) throw new Error('Server returned ' + resp.status);
    const data = await resp.json();

    svgOut.innerHTML = data.svg;

    const blob = new Blob([data.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    downloadSvg.href = url;
    downloadSvg.style.display = 'inline-block';

    status.textContent = 'Done — download below or copy the SVG.';
  } catch (err) {
    console.error(err);
    status.textContent = 'Error: ' + (err.message || 'unknown');
  }
});
