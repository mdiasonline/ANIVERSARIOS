export const getDaysRemaining = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to midnight

  const birthDate = new Date(dateStr);
  // Note: birthDate comes from YYYY-MM-DD string, so new Date(dateStr) depends on browser timezone interpretation
  // Ideally, we treat YYYY-MM-DD as local date parts.
  // Converting the input dateStr parts to local date avoids UTC shifts.
  const [year, month, day] = dateStr.split('-').map(Number);
  const nextBirthday = new Date(today.getFullYear(), month - 1, day);

  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }

  const diffTime = Math.abs(nextBirthday.getTime() - today.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateAge = (dateStr: string): number => {
  const today = new Date();
  const birthDate = new Date(dateStr);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  // Adjust if birthday hasn't occurred yet this year
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

export const getDayMonth = (dateStr: string): string => {
  const date = new Date(dateStr);
  // Adjust for timezone offset for simple date strings
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return `${String(adjustedDate.getDate()).padStart(2, '0')}/${String(adjustedDate.getMonth() + 1).padStart(2, '0')}`;
};

export const getMonthName = (dateStr: string): string => {
  const date = new Date(dateStr);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return adjustedDate.toLocaleString('pt-BR', { month: 'short' });
};

export const getDayNumber = (dateStr: string): string => {
  const date = new Date(dateStr);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return String(adjustedDate.getDate()).padStart(2, '0');
};

export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;

  // Handle 12-14 digits (with country code, e.g., 55)
  // Format: +55 (XX) XXXXX-XXXX
  const country = digits.slice(0, 2);
  const area = digits.slice(2, 4);
  const numberPart1 = digits.slice(4, digits.length - 4);
  const numberPart2 = digits.slice(digits.length - 4);

  return `+${country} (${area}) ${numberPart1}-${numberPart2}`;
};

export const formatDate = (value: string): string => {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 0) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
};

export const validateDate = (dateStr: string): boolean => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return false;
  const [day, month, year] = dateStr.split('/').map(Number);
  if (month < 1 || month > 12) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= daysInMonth;
};

export const validatePhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 11;
};

export const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const translateError = (error: any): string => {
  const message = error?.message || error?.error_description || (typeof error === 'string' ? error : 'Ocorreu um erro inesperado.');

  // Map of common English errors to Portuguese
  const translations: { [key: string]: string } = {
    'User already registered': 'Este e-mail já está cadastrado.',
    'Invalid login credentials': 'E-mail ou senha incorretos.',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
    'Rate limit exceeded': 'Muitas tentativas. Aguarde um pouco.',
    'Email not confirmed': 'Sua conta ainda não foi ativada ou aprovada. Aguarde a liberação do administrador.',
    'User not found': 'Usuário não encontrado.',
    'Invalid refresh token': 'Sessão expirada. Faça login novamente.',
    'JWT expired': 'Sessão expirada. Faça login novamente.',
    'Database error': 'Erro no banco de dados. Tente novamente.',
    'Signups not allowed for this instance': 'Novos cadastros estão desativados temporariamente.',
    'New password should be different from the old password.': 'A nova senha deve ser diferente da anterior.',
  };

  // Direct match
  if (translations[message]) {
    return translations[message];
  }

  // Partial match checks
  if (message.includes('Password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
  if (message.includes('rate limit')) return 'Muitas tentativas. Aguarde alguns minutos.';
  if (message.includes('weak password')) return 'A senha é muito fraca. Use uma senha mais forte.';
  if (message.includes('unique constraint')) return 'Este registro já existe.';
  if (message.includes('violates foreign key')) return 'Erro de referência de dados.';
  if (message.includes('JSON object requested, multiple (or no) rows returned')) return 'Erro ao buscar dados (nenhum ou múltiplos resultados).';
  if (message.toLowerCase().includes('network')) return 'Erro de conexão. Verifique sua internet.';

  return message; // Return original if no translation found
};

export const convertArrayToCSV = (data: any[]): string => {
  if (!data || data.length === 0) return '';

  const separator = ',';
  const keys = Object.keys(data[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    data
      .map((row) => {
        return keys
          .map((k) => {
            let cell = row[k] === null || row[k] === undefined ? '' : row[k];
            cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
            cell = cell.replace(/"/g, '""');
            if (cell.search(/("|,|\n)/g) >= 0) {
              cell = `"${cell}"`;
            }
            return cell;
          })
          .join(separator);
      })
      .join('\n');

  return csvContent;
};

export const downloadCSV = (csvContent: string, fileName: string) => {
  // Add BOM for Excel verification
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
    image.src = url;
  });

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  // croppedAreaPixels values are bounding box relative
  // extract the cropped image using these values
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // paste generated rotate image at the top left corner
  ctx.putImageData(data, 0, 0);

  // As Base64 string
  // return canvas.toDataURL('image/jpeg');

  // As a blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((file) => {
      resolve(file);
    }, 'image/jpeg');
  });
}

