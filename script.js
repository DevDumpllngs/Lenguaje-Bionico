// Selecciona el botón y la sección
const boton = document.querySelector('button');
const convertSection = document.querySelector('.convert-section');
const convertButton = document.querySelector('.convert');

// Agrega un evento de clic al botón
boton.addEventListener('click', (e) => {
  e.preventDefault(); // Evita el comportamiento por defecto del botón
  
  // Obtiene la posición actual de la ventana
  const startY = window.scrollY;
  
  // Obtiene la posición de la sección
  const endY = convertSection.offsetTop;
  
  // Calcula la distancia a desplazar
  const distance = endY - startY;
  
  // Establece la duración del desplazamiento
  const duration = 1000; // 1 segundo
  
  // Crea un efecto de desplazamiento suave
  const startTime = performance.now();
  function animate() {
    const currentTime = performance.now();
    const elapsed = currentTime - startTime;
    const progress = elapsed / duration;
    const newY = startY + (distance * progress);
    window.scrollTo(0, newY);
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Ejecuta la función convertToBionic() después del desplazamiento
      convertButton.click();
    }
  }
  animate();
});

// Función para convertir el texto a lectura biónica
function convertToBionic() {
    let inputText = document.getElementById('inputText').value;
    let outputText = document.getElementById('outputText');
    outputText.innerHTML = bionicText(inputText);
}

// Función para procesar la lectura biónica
function bionicText(text) {
    return text.split(' ').map(word => {
        let mid = Math.ceil(word.length / 2);
        return `<b>${word.substring(0, mid)}</b>${word.substring(mid)}`;
    }).join(' ');
}

// Evento para cargar archivo de texto
document.getElementById('fileInput').addEventListener('change', function() {
    let file = this.files[0];
    let reader = new FileReader();

    reader.onload = function(e) {
        let fileType = file.type;
        if (fileType === 'application/pdf') {
            extractTextFromPDF(e.target.result);
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            extractTextFromWord(e.target.result);
        } else {
            document.getElementById('inputText').value = e.target.result;
        }
    };

    reader.readAsArrayBuffer(file);
});

// Función para extraer texto de un archivo PDF
function extractTextFromPDF(arrayBuffer) {
    let pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

    let loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    loadingTask.promise.then(function(pdf) {
        let pagesPromises = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            pagesPromises.push(pdf.getPage(i).then(page => {
                return page.getTextContent().then(textContent => {
                    return textContent.items.map(item => item.str).join(' ');
                });
            }));
        }
        Promise.all(pagesPromises).then(pagesText => {
            document.getElementById('inputText').value = pagesText.join(' ');
        });
    });
}

// Función para extraer texto de un archivo Word
function extractTextFromWord(arrayBuffer) {
    let zip = new JSZip();
    zip.loadAsync(arrayBuffer).then(function(content) {
        let doc = new Docxtemplater().loadZip(content);
        let text = doc.getFullText();
        document.getElementById('inputText').value = text;
    });
}
