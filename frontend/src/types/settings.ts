export interface ApiSettings {
  bybitApiKey: string;
  bybitSecretKey: string;
}

export interface SettingsStatus {
  configured: boolean;
}

export interface SettingsAuthorizeRequest {
  password: string;
}

export interface SettingsUpdateRequest extends Partial<ApiSettings> {
  password: string;
}

export type SettingsAuthorizeResponse = ApiSettings;



