// src/types/integrations.ts

export interface IntegrationFormData {
    storeName: string;
    productApiUrl: string;
    platform: string;
    apiKey: string;
    industry: string;
    customPrompt: string;
}

export interface WidgetConfig {
    primaryColor: string;
    secondaryColor: string;
    buttonSize: string;
    windowWidth: string;
    windowHeight: string;
    headerText: string;
    fontFamily: string;
}

export interface StoreDetailsErrors {
    storeName: string;
    productApiUrl: string;
    industry: string;
    apiKey: string;
}