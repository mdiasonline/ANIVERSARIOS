
const formatPhone = (value: string): string => {
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

const phone1 = "+5521989898989";
const phone2 = "+5521986484427";

console.log(`${phone1} -> ${formatPhone(phone1)}`);
console.log(`${phone2} -> ${formatPhone(phone2)}`);
