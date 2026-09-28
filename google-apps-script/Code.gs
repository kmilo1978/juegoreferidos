/**
 * ============================================================================
 * GOOGLE APPS SCRIPT WEBHOOK — MOTOR DE FIDELIZACIÓN Y REFERIDOS QR
 * ============================================================================
 * 
 * INSTRUCCIONES DE CONFIGURACIÓN:
 * 1. Crea una hoja en blanco en Google Drive (ej: "Clientes_Premios_QR").
 * 2. En la Fila 1 (Cabeceras), escribe:
 *    [A] Fecha / Hora
 *    [B] Cliente
 *    [C] WhatsApp (+57)
 *    [D] Email
 *    [E] Instagram
 *    [F] Premio Ganado
 *    [G] Código Único
 *    [H] ¿Validado en Caja?
 *    [I] Hora Canje
 * 3. Ve a Extensiones > Apps Script, borra todo y pega este archivo.
 * 4. Cambia 'SECRET_PIN' por el PIN de 4 dígitos de tu negocio (ej: "1978").
 * 5. Haz clic en "Implementar" > "Nueva implementación" > "Aplicación web":
 *    - Ejecutar como: "Yo (tu correo)"
 *    - Quién tiene acceso: "Cualquier usuario"
 * 6. Copia la URL de la aplicación web y pégala en tu proyecto frontend.
 */

var SECRET_PIN = "1978"; // PIN de 4 dígitos para autorización del cajero o mesero

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var action = data.action; // 'CREATE_PRIZE' | 'VALIDATE_PIN'

    // ACCIÓN 1: Registrar nuevo premio ganado en la ruleta
    if (action === 'CREATE_PRIZE') {
      sheet.appendRow([
        new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
        data.fullName || 'Cliente Anónimo',
        data.whatsapp || '',
        data.email || 'N/A',
        data.instagram || 'N/A',
        data.prizeName || '',
        data.uniqueCode || '',
        'NO', // Inicialmente disponible
        ''    // Sin hora de canje aún
      ]);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Premio registrado con éxito en Google Sheets',
        code: data.uniqueCode
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // ACCIÓN 2: Validar en caja mediante PIN del personal
    if (action === 'VALIDATE_PIN') {
      if (String(data.pin).trim() !== SECRET_PIN) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: 'PIN incorrecto. Uso exclusivo del personal autorizado.'
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var codeToFind = String(data.uniqueCode).trim();
      var values = sheet.getDataRange().getValues();
      var foundRow = -1;

      for (var i = 1; i < values.length; i++) {
        if (String(values[i][6]).trim() === codeToFind) { // Columna G: Código único
          foundRow = i + 1;
          break;
        }
      }

      if (foundRow === -1) {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Código de cupón no encontrado en el sistema.'
        })).setMimeType(ContentService.MimeType.JSON);
      }

      var currentStatus = sheet.getRange(foundRow, 8).getValue(); // Columna H
      if (currentStatus === 'SÍ') {
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Este código ya fue redimido previamente en caja.'
        })).setMimeType(ContentService.MimeType.JSON);
      }

      // Marcar como SÍ y registrar la hora de redención
      sheet.getRange(foundRow, 8).setValue('SÍ');
      sheet.getRange(foundRow, 9).setValue(new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota' }));

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: '✓ Cupón validado exitosamente en caja'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Acción no reconocida'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Para pruebas rápidas de conectividad desde el navegador
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    message: 'Servicio Webhook de Fidelización QR activo y respondiendo.'
  })).setMimeType(ContentService.MimeType.JSON);
}
