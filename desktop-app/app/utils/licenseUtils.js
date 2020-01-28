import settings from 'electron-settings';
import path from 'path';

const LICENSE_KEY = 'LICENSE_KEY';

export function saveLicenseKey(key) {
  settings.set(LICENSE_KEY, key);
}

export function getLicensekey() {
  return settings.get(LICENSE_KEY);
}

export async function validateLicenseKey(licenseKey) {
  if (!licenseKey) {
    return {
      status: false,
      reason: 'License key cannot be empty, please enter a valid one.',
    };
  }
  try {
    console.log(
      `${path.join(
        process.env.REST_BASE_URL,
        '/validate-license'
      )}?licenseKey=${licenseKey}`
    );
    alert(`URL changed: ${process.env.REST_BASE_URL}`);
    const responseBody = await fetch(
      `${path.join(
        process.env.REST_BASE_URL,
        '/validate-license'
      )}?licenseKey=${licenseKey}`
    ).then(response => response.json());
    if (responseBody.status) {
      return {status: true};
    } else {
      return {
        status: false,
        reason: 'Not a valid license key, please verify the key and try again.',
      };
    }
  } catch (err) {
    console.log('Error', err);
    return {
      status: false,
      reason: 'Unable to validate the license key, please try again.',
    };
  }
}
