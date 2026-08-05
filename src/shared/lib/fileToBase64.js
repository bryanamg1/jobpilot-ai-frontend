export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result ?? '');
      resolve(result.replace(/^data:[^;]+;base64,/u, ''));
    };

    reader.onerror = () => {
      reject(new Error('No se pudo leer el archivo seleccionado.'));
    };

    reader.readAsDataURL(file);
  });
}
