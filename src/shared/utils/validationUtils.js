export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9]{10}$/,
  placa: /^[A-Z]{3}[0-9]{3}$|^[A-Z]{3}[0-9]{2}[A-Z]$/,
  cedula: /^[0-9]{8,10}$/,
  password: /^.{6,}$/,
  noLeadingSpaces: /^(?!\s).+$/, // No espacios al inicio
  onlyLetters: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/, // Solo letras y espacios
  onlyNumbers: /^[0-9]+$/,
}

export const validationMessages = {
  required: (field) => `${field} es obligatorio`,
  email: "Por favor ingrese un correo electrónico válido",
  phone: "El teléfono debe tener 10 dígitos",
  placa: "Formato de placa inválido (ej: ABC123 o ABC12D)",
  cedula: "La cédula debe tener entre 8 y 10 dígitos",
  password: "La contraseña debe tener al menos 6 caracteres",
  minLength: (field, min) => `${field} debe tener al menos ${min} caracteres`,
  maxLength: (field, max) => `${field} no puede exceder ${max} caracteres`,
  noLeadingSpaces: (field) => `${field} no puede comenzar con espacios`,
  onlyLetters: (field) => `${field} solo puede contener letras`,
  onlyNumbers: (field) => `${field} solo puede contener números`,
}

export const validateField = (value, rules = {}) => {
  const error = ""

  // Required validation
  if (rules.required && !value.trim()) {
    return validationMessages.required(rules.fieldName || "Campo")
  }

  // Skip other validations if field is empty and not required
  if (!value.trim()) return ""

  // No leading spaces validation
  if (rules.noLeadingSpaces && !validationPatterns.noLeadingSpaces.test(value)) {
    return validationMessages.noLeadingSpaces(rules.fieldName || "Campo")
  }

  // Only letters validation
  if (rules.onlyLetters && !validationPatterns.onlyLetters.test(value)) {
    return validationMessages.onlyLetters(rules.fieldName || "Campo")
  }

  // Only numbers validation
  if (rules.onlyNumbers && !validationPatterns.onlyNumbers.test(value)) {
    return validationMessages.onlyNumbers(rules.fieldName || "Campo")
  }

  // Email validation
  if (rules.email && !validationPatterns.email.test(value)) {
    return validationMessages.email
  }

  // Phone validation
  if (rules.phone && !validationPatterns.phone.test(value.replace(/\D/g, ""))) {
    return validationMessages.phone
  }

  // Placa validation
  if (rules.placa && !validationPatterns.placa.test(value.toUpperCase())) {
    return validationMessages.placa
  }

  // Cedula validation
  if (rules.cedula && !validationPatterns.cedula.test(value)) {
    return validationMessages.cedula
  }

  // Password validation
  if (rules.password && !validationPatterns.password.test(value)) {
    return validationMessages.password
  }

  // Min length validation
  if (rules.minLength && value.length < rules.minLength) {
    return validationMessages.minLength(rules.fieldName || "Campo", rules.minLength)
  }

  // Max length validation
  if (rules.maxLength && value.length > rules.maxLength) {
    return validationMessages.maxLength(rules.fieldName || "Campo", rules.maxLength)
  }

  return ""
}

export const validateForm = (formData, validationRules) => {
  const errors = {}

  Object.keys(validationRules).forEach((fieldName) => {
    const value = formData[fieldName] || ""
    const rules = validationRules[fieldName]
    const error = validateField(value, rules)

    if (error) {
      errors[fieldName] = error
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Common validation rule sets
export const commonValidationRules = {
  email: {
    required: true,
    email: true,
    fieldName: "Correo electrónico",
  },
  password: {
    required: true,
    password: true,
    fieldName: "Contraseña",
  },
  phone: {
    required: true,
    phone: true,
    fieldName: "Teléfono",
  },
  placa: {
    required: true,
    placa: true,
    fieldName: "Placa",
  },
  cedula: {
    required: true,
    cedula: true,
    fieldName: "Cédula",
  },
  nombre: {
    required: true,
    minLength: 2,
    maxLength: 50,
    fieldName: "Nombre",
  },
  apellido: {
    required: true,
    minLength: 2,
    maxLength: 50,
    fieldName: "Apellido",
  },
  color: {
    required: true,
    minLength: 3,
    maxLength: 45,
    fieldName: "Color",
  },
  tipo_vehiculo: {
    required: true,
    fieldName: "Tipo de vehículo",
  },
  referencia_id: {
    required: true,
    fieldName: "Referencia",
  },
  cliente_id: {
    required: true,
    fieldName: "Cliente",
  },
  noLeadingSpaces: true,
  onlyLetters: true,
  onlyNumbers: true,
}
