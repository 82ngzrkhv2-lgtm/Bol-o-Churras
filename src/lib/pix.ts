/**
 * Utilities for generating PIX BR Code (EMV)
 */

export function generatePixPayload(pixKey: string, amount: number, merchantName: string = 'Bolao e Churras', merchantCity: string = 'Brasil'): string {
  // Trata o nome e cidade (max 25 e 15 chars e sem acentos, recomendado)
  const safeName = merchantName.substring(0, 25).replace(/[^\w\s]/gi, '')
  const safeCity = merchantCity.substring(0, 15).replace(/[^\w\s]/gi, '')
  
  // Format amount (must have 2 decimal places with dot)
  const formattedAmount = amount.toFixed(2)

  // Payload format blocks
  const payloadFormatIndicator = '000201'
  const merchantAccountInformation = `26${(pixKey.length + 22).toString().padStart(2, '0')}0014br.gov.bcb.pix01${pixKey.length.toString().padStart(2, '0')}${pixKey}`
  const merchantCategoryCode = '52040000'
  const transactionCurrency = '5303986' // BRL
  const transactionAmount = `54${formattedAmount.length.toString().padStart(2, '0')}${formattedAmount}`
  const countryCode = '5802BR'
  const merchantNameBlock = `59${safeName.length.toString().padStart(2, '0')}${safeName}`
  const merchantCityBlock = `60${safeCity.length.toString().padStart(2, '0')}${safeCity}`
  const additionalDataFieldTemplate = '62070503***'
  
  // Combine all parts
  const payloadToHash = `${payloadFormatIndicator}${merchantAccountInformation}${merchantCategoryCode}${transactionCurrency}${transactionAmount}${countryCode}${merchantNameBlock}${merchantCityBlock}${additionalDataFieldTemplate}6304`

  // Calculate CRC16
  const crc16 = calcCRC16(payloadToHash)

  return `${payloadToHash}${crc16}`
}

function calcCRC16(payload: string): string {
  let crc = 0xFFFF
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) > 0) {
        crc = (crc << 1) ^ 0x1021
      } else {
        crc = crc << 1
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0')
}
