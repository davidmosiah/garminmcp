export type ResponseFormat = "markdown" | "json";
export type PrivacyMode = "summary" | "structured" | "raw";

export interface GarminTokenSet {
  di_token?: string;
  di_refresh_token?: string;
  di_client_id?: string;
  jwt_web?: string;
  csrf_token?: string;
  display_name?: string;
  full_name?: string;
  unit_system?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GarminConfig {
  tokenPath: string;
  privacyMode: PrivacyMode;
  cacheEnabled: boolean;
  cachePath: string;
  domain: "garmin.com" | "garmin.cn";
}

export interface GarminCollection<T = unknown> {
  records?: T[];
  next_page?: number;
}

export interface ToolResponse<T> extends Record<string, unknown> {
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: T;
  isError?: boolean;
}
