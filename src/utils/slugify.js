export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos y tildes
    .replace(/[^a-z0-9\s-]/g, '')    // Elimina caracteres especiales
    .replace(/[\s_]+/g, '-')         // Reemplaza espacios y guiones bajos por guiones
    .replace(/^-+|-+$/g, '');        // Quita guiones iniciales y finales
};
