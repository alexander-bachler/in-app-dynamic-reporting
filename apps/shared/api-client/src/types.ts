export interface ClientCredentials {
    id: string;
    secret: string;
}

export interface DeviceInputParams {
    deviceId?: string;
    lmId?: string;
    meteringPoint?: string;
}

export interface Node {
    object_id: string;
    title: string;
    custom_key: string;
    children: Node[];
}