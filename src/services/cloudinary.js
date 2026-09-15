/**
 * Cloudinary Upload Service
 * Permite la subida directa de imágenes desde el cliente mediante Unsigned Upload Presets.
 * Compatible con variables de entorno de Vite (VITE_CLOUDINARY_*) y configuración desde el panel admin.
 */

const STORAGE_KEY = 'otakonce_cloudinary_config';

/**
 * Obtiene la configuración activa de Cloudinary.
 * Prioridad: Variables de entorno (.env / Vercel) > Configuración guardada en el panel admin.
 */
export const getCloudinaryConfig = () => {
  const envCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
  const envUploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
  const envFolder = import.meta.env.VITE_CLOUDINARY_FOLDER || 'otakonce';

  let localConfig = {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      localConfig = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error leyendo configuración local de Cloudinary:', e);
  }

  return {
    cloudName: (envCloudName || localConfig.cloudName || '').trim(),
    uploadPreset: (envUploadPreset || localConfig.uploadPreset || '').trim(),
    folder: (envFolder || localConfig.folder || 'otakonce').trim(),
    isFromEnv: Boolean(envCloudName && envUploadPreset)
  };
};

/**
 * Guarda o actualiza la configuración de Cloudinary desde el panel de administración.
 */
export const saveCloudinaryConfig = ({ cloudName, uploadPreset, folder = 'otakonce' }) => {
  const config = {
    cloudName: (cloudName || '').trim(),
    uploadPreset: (uploadPreset || '').trim(),
    folder: (folder || 'otakonce').trim()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  return config;
};

/**
 * Verifica si Cloudinary está configurado y listo para recibir subidas.
 */
export const isCloudinaryConfigured = () => {
  const { cloudName, uploadPreset } = getCloudinaryConfig();
  return Boolean(cloudName && uploadPreset);
};

/**
 * Sube un archivo de imagen directamente a Cloudinary usando Unsigned Upload.
 * @param {File} file Archivo de imagen seleccionado por el usuario.
 * @param {Object} options Opciones adicionales.
 * @returns {Promise<{ url: string, publicId: string, format: string, width: number, height: number }>}
 */
export const uploadToCloudinary = async (file, _options = {}) => {
  const { cloudName, uploadPreset, folder } = getCloudinaryConfig();

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary no está configurado. Por favor ingresa tu Cloud Name y Upload Preset en el panel de control o en tus variables de entorno (.env).'
    );
  }

  // Validación de archivo
  if (!file || !(file instanceof File)) {
    throw new Error('No se proporcionó un archivo válido para subir.');
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('La imagen excede el límite máximo de 10 MB permitido.');
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Formato no soportado. Por favor sube una imagen JPG, PNG, WEBP o GIF (SVG no permitido por seguridad).');
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  if (folder) {
    formData.append('folder', folder);
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.message || 'Error desconocido al subir imagen a Cloudinary.';
      if (errorMsg.includes('Upload preset not found')) {
        throw new Error(`El Upload Preset "${uploadPreset}" no existe en la nube "${cloudName}". Verifica que esté configurado como "Unsigned" en Cloudinary.`);
      }
      throw new Error(errorMsg);
    }

    return {
      url: data.secure_url || data.url,
      publicId: data.public_id,
      format: data.format,
      width: data.width,
      height: data.height,
      bytes: data.bytes
    };
  } catch (err) {
    console.error('Cloudinary Upload Error:', err);
    throw err;
  }
};

/**
 * Aplica transformaciones de optimización automática de Cloudinary a una URL.
 * Si no es una URL de Cloudinary, retorna la URL original sin modificaciones.
 */
export const getOptimizedCloudinaryUrl = (url, { width = null, quality = 'auto', format = 'auto' } = {}) => {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
    return url;
  }

  const transformations = [`f_${format}`, `q_${quality}`];
  if (width) {
    transformations.push(`w_${width}`, 'c_limit');
  }

  const transformString = transformations.join(',');
  return url.replace('/image/upload/', `/image/upload/${transformString}/`);
};
