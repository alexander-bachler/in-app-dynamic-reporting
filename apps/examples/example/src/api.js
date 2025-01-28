// Konfiguration aus der .env-Datei
const clientId = process.env.REACT_APP_CLIENT_ID;
const clientSecret = process.env.REACT_APP_CLIENT_SECRET;
const baseUrl = process.env.REACT_APP_BASE_URL;

let accessToken = ''; // Variable für den Access Token
let clientCredentials = { id: '', secret: '' }; // Variable für Client Credentials

async function getAccessToken() {
    if (accessToken) {
        return accessToken; // Rückgabe des vorhandenen Tokens
    }

    const response = await fetch(`${baseUrl}/oauth/access_token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "client_id": clientId,
            "client_secret": clientSecret,
            "grant_type": "client_credentials"
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Fehler beim Abrufen des Access Tokens:', response.status, errorText);
        throw new Error(`Token-Anfrage fehlgeschlagen: ${response.status}`);
    }

    const data = await response.json();
    accessToken = data.access_token; // Speichern des Tokens
    return accessToken; // Rückgabe des Tokens
}

// Funktion zum Setzen des Access Tokens
function setAccessToken(token) {
    accessToken = token; // Setzen des Tokens
    console.log('Access Token gesetzt:', accessToken);
}

// Funktion zum Setzen der Client-Daten
function setClientCredentials (id, secret) {
    clientCredentials.id = id;
    clientCredentials.secret = secret;
};

// Funktion zum Abrufen aller Geräte
async function getAllDevices() {
    await getAccessToken();
    const url = `${baseUrl}/v2/devices/all`;
    console.log('API URL für alle Geräte:', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Fehler bei der API-Anfrage für alle Geräte:', response.status, errorText);
        throw new Error(`API-Anfrage für alle Geräte fehlgeschlagen: ${response.status}`);
    }

    const data = await response.json();
    console.log('Geräte-Daten:', data); // Überprüfe die Struktur der Daten

    // Konvertiere das Objekt in ein Array
    const devicesArray = Object.values(data); // Verwende Object.values, um die Werte in ein Array zu konvertieren
    return devicesArray; // Rückgabe des Arrays
}

// Neue Funktion zum Abrufen der Eingaben für ein bestimmtes Gerät
async function getInputsForDevice({ deviceId, lmId, meteringPoint }) {
    await getAccessToken();
    let url = `${baseUrl}/v2/devices?`;

    if (deviceId) {
        url += `id=${deviceId}`;
    } else if (lmId) {
        url += `lmId=${lmId}`;
    } else if (meteringPoint) {
        url += `meteringPoint=${meteringPoint}`;
    } else {
        throw new Error('Kein gültiger Parameter übergeben. Bitte deviceId, lmId oder meteringPoint angeben.');
    }

    console.log('API URL für Eingaben des Geräts:', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Fehler bei der API-Anfrage für Eingaben des Geräts:', response.status, errorText);
        throw new Error(`API-Anfrage für Eingaben des Geräts fehlgeschlagen: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

// Neue Funktion zum Abrufen der Objekte
async function getObjects(objectId) {
    await getAccessToken();
    let url = `${baseUrl}/v2/children?object_type=object`;

    if (objectId) {
        url = `${baseUrl}/v2/children/${objectId}?object_type=object`;
    }

    console.log('API URL für Objekte:', url);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Fehler bei der API-Anfrage für Objekte:', response.status, errorText);
        throw new Error(`API-Anfrage für Objekte fehlgeschlagen: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

// Umbenennung und Anpassung der Funktion
async function getDataForInput(timeFrom, timeTo, inputId, granularity = 'PT60M', timeZone = 'Europe/Vienna') {
    await getAccessToken(); // Sicherstellen, dass der Token verfügbar ist
    const url = `${baseUrl}/v2/device-inputs/${inputId}/data?time_from=${timeFrom}&time_to=${timeTo}&granularity=${granularity}&time_zone=${timeZone}`; // Verwendung der Basis-URL
    console.log('API URL für Eingaben:', url); // Debugging: Zeigen Sie die URL an

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Fehler bei der API-Anfrage:', response.status, errorText);
        throw new Error(`API-Anfrage fehlgeschlagen: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

// Neue Funktion zum Abrufen der Messpunkte
async function getMeasuringPoint(objectId) {
    await getAccessToken(); // Sicherstellen, dass der Token verfügbar ist
    let url = `${baseUrl}/v2/children?object_type=attribute`; // Verwendung der Basis-URL

    // Wenn objectId gesetzt ist, URL anpassen
    if (objectId) {
        url = `${baseUrl}/v2/children/${objectId}?object_type=attribute`; // Verwendung der Basis-URL
    }

    console.log('API URL für Messpunkte:', url); // Debugging: Zeigen Sie die URL an

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Fehler bei der API-Anfrage für Messpunkte:', response.status, errorText);
        throw new Error(`API-Anfrage für Messpunkte fehlgeschlagen: ${response.status}`);
    }

    const data = await response.json();

    console.log('Measurement Point', data);

    return data;
}

// Neue Funktion zum Rekursiven Abrufen der Objekte
async function getObjectTree(objectId = null) {
    const objects = await getObjects(objectId); // Rufe die Objekte ab
    const tree = [];

    console.log(`Abrufen von Objekten für objectId: ${objectId}`); // Debugging

    for (const obj of objects) {
        const node = {
            object_id: obj.object_id,
            title: obj.payload.title,
            custom_key: obj.custom_key,
        };

        // Überprüfe, ob children_info existiert und ob es Kinder gibt
        if (obj.children_info && obj.children_info.object > 0) {
            const children = await getObjectTree(obj.object_id); // Rufe die Kinderobjekte ab
            node.children = children; // Füge die Kinder zum aktuellen Knoten hinzu
        }

        tree.push(node); // Füge den Knoten zum Baum hinzu
    }

    return tree; // Rückgabe des gesamten Baums
}

// Neue Funktion zum Abrufen der Daten für einen Messpunkt
async function getDataForMeasuringPoint(measuringPointId, timeFrom, timeTo, granularity = 'PT1M', timeZone = 'Europe/Vienna') {
    await getAccessToken(); // Sicherstellen, dass der Token verfügbar ist
    const url = `${baseUrl}/v2/data/${measuringPointId}?time_from=${timeFrom}&time_to=${timeTo}&granularity=${granularity}&time_zone=${timeZone}`; // Verwendung der Basis-URL
    console.log('API URL für Messpunkt-Daten:', url); // Debugging: Zeigen Sie die URL an

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Fehler bei der API-Anfrage für Messpunkt-Daten:', response.status, errorText);
        throw new Error(`API-Anfrage für Messpunkt-Daten fehlgeschlagen: ${response.status}`);
    }

    return await response.json();
}

// Exportieren der Funktionen
export {
    getAccessToken,
    setAccessToken,
    setClientCredentials, // Ensure this is only listed once
    getAllDevices,
    getInputsForDevice,
    getObjects,
    getDataForInput,
    getMeasuringPoint,
    getObjectTree,
    getDataForMeasuringPoint
};