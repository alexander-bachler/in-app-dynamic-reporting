import cache from './cache';
import {ClientCredentials, DeviceInputParams, Node} from './types';

// Konfiguration aus der .env-Datei
const clientId: string | undefined = process.env.REACT_APP_CLIENT_ID;
const clientSecret: string | undefined = process.env.REACT_APP_CLIENT_SECRET;

class ApiClient {
    private readonly baseUrl: string | undefined;
    private accessToken: string;
    private clientCredentials: ClientCredentials;

    constructor() {
        this.baseUrl = process.env.REACT_APP_BASE_URL;
        this.accessToken = ''; // Variable für den Access Token
        this.clientCredentials = {id: '', secret: ''}; // Variable für Client Credentials
    }

    public async getAccessToken(): Promise<string> {
        if (this.accessToken) {
            return this.accessToken; // Rückgabe des vorhandenen Tokens
        }

        const response = await fetch(`${this.baseUrl}/oauth/access_token`, {
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
        this.setAccessToken(data.access_token); // Speichern des Tokens
        return this.accessToken; // Rückgabe des Tokens
    }

    // Funktion zum Setzen des Access Tokens
    public setAccessToken(token: string): void {
        this.accessToken = token; // Setzen des Tokens
        console.log('Access Token gesetzt:', this.accessToken);
    }

    // Funktion zum Setzen der Client-Daten
    public setClientCredentials(id: string, secret: string): void {
        this.clientCredentials.id = id;
        this.clientCredentials.secret = secret;
    }

    // Funktion zum Abrufen aller Geräte
    public async getAllDevices(): Promise<any[]> {
        const cacheKey = 'allDevices';
        const cachedData = cache.get(cacheKey);

        if (cachedData) {
            console.log('Returning cached data for all devices');
            return cachedData as any[];
        }

        await this.getAccessToken();
        const url = `${this.baseUrl}/v2/devices/all`;
        console.log('API URL for all devices:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error fetching all devices:', response.status, errorText);
            throw new Error(`API request for all devices failed: ${response.status}`);
        }

        const data = await response.json();
        const devicesArray = Object.values(data);
        cache.set(cacheKey, devicesArray); // Cache the data
        return devicesArray;
    }

    // Neue Funktion zum Abrufen der Eingaben für ein bestimmtes Gerät
    public async getInputsForDevice(params: DeviceInputParams): Promise<any> {
        await this.getAccessToken();
        let url = `${this.baseUrl}/v2/devices?`;

        if (params.deviceId) {
            url += `id=${params.deviceId}`;
        } else if (params.lmId) {
            url += `lmId=${params.lmId}`;
        } else if (params.meteringPoint) {
            url += `meteringPoint=${params.meteringPoint}`;
        } else {
            throw new Error('Kein gültiger Parameter übergeben. Bitte deviceId, lmId oder meteringPoint angeben.');
        }

        console.log('API URL für Eingaben des Geräts:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
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
    public async getObjects(objectId?: string): Promise<any> {
        await this.getAccessToken();
        let url = `${this.baseUrl}/v2/children?object_type=object`;

        if (objectId) {
            url = `${this.baseUrl}/v2/children/${objectId}?object_type=object`;
        }

        console.log('API URL für Objekte:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
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
    public async getDataForInput(timeFrom: string, timeTo: string, inputId: string, granularity: string = 'PT60M', timeZone: string = 'Europe/Vienna'): Promise<any> {
        const cacheKey = `dataForInput_${inputId}_${timeFrom}_${timeTo}_${granularity}_${timeZone}`;
        const cachedData = cache.get(cacheKey);

        if (cachedData) {
            console.log(`Returning cached data for input with ID: ${inputId}`);
            return cachedData as any[];
        }

        await this.getAccessToken(); // Ensure the token is available
        const url = `${this.baseUrl}/v2/device-inputs/${inputId}/data?time_from=${timeFrom}&time_to=${timeTo}&granularity=${granularity}&time_zone=${timeZone}`; // Use the base URL
        console.log('API URL for input data:', url); // Debugging: Show the URL

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error fetching input data:', response.status, errorText);
            throw new Error(`API request for input data failed: ${response.status}`);
        }

        const data = await response.json();
        cache.set(cacheKey, data); // Cache the data
        return data;
    }

    // Neue Funktion zum Abrufen der Messpunkte
    public async getMeasuringPoint(objectId?: string): Promise<any> {
        const cacheKey = `measuringPoint_${objectId}`;
        const cachedData = cache.get(cacheKey);

        if (cachedData) {
            console.log(`Returning cached data for measuring point with objectId: ${objectId}`);
            return cachedData as any[];
        }

        await this.getAccessToken(); // Ensure the token is available
        let url = `${this.baseUrl}/v2/children?object_type=attribute`; // Base URL

        // Adjust URL if objectId is set
        if (objectId) {
            url = `${this.baseUrl}/v2/children/${objectId}?object_type=attribute`;
        }

        console.log('API URL for measuring points:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error fetching measuring points:', response.status, errorText);
            throw new Error(`API request for measuring points failed: ${response.status}`);
        }

        const data = await response.json();
        cache.set(cacheKey, data); // Cache the data
        return data;
    }

    // Neue Funktion zum Rekursiven Abrufen der Objekte
    public async getObjectTree(objectId: string | null = null): Promise<any[]> {
        const cacheKey = `objectTree_${objectId}`;
        const cachedData = cache.get(cacheKey);

        if (cachedData) {
            console.log(`Returning cached data for object tree with objectId: ${objectId}`);
            return cachedData as any[];
        }

        const objects = await this.getObjects(objectId ? objectId : "");
        const tree: any[] = [];

        console.log(`Fetching objects for objectId: ${objectId}`);

        for (const obj of objects) {
            const node: Node = {
                object_id: obj.object_id,
                title: obj.payload.title,
                custom_key: obj.custom_key,
                children: []
            };

            if (obj.children_info && obj.children_info.object > 0) {
                node.children = await this.getObjectTree(obj.object_id);
            }

            tree.push(node);
        }

        cache.set(cacheKey, tree); // Cache the data
        return tree;
    }

    // Neue Funktion zum Abrufen der Daten für einen Messpunkt
    public async getDataForMeasuringPoint(measuringPointId: string, timeFrom: string, timeTo: string, granularity: string = 'PT1M', timeZone: string = 'Europe/Vienna'): Promise<any> {
        const cacheKey = `measuringPoint_${measuringPointId}_${timeFrom}_${timeTo}_${granularity}_${timeZone}`;
        const cachedData = cache.get(cacheKey);

        if (cachedData) {
            console.log(`Returning cached data for measuring point with ID: ${measuringPointId}`);
            return cachedData as any[];
        }

        await this.getAccessToken(); // Ensure the token is available
        const url = `${this.baseUrl}/v2/data/${measuringPointId}?time_from=${timeFrom}&time_to=${timeTo}&granularity=${granularity}&time_zone=${timeZone}`;
        console.log('API URL for measuring point data:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error fetching measuring point data:', response.status, errorText);
            throw new Error(`API request for measuring point data failed: ${response.status}`);
        }

        const data = await response.json();
        cache.set(cacheKey, data); // Cache the data
        return data;
    }

    public flushCache(): void {
        cache.clear();
        console.log('Cache has been flushed');
    }
}

// Exportieren der Funktionen
export default ApiClient;