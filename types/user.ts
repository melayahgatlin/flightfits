export interface UserProfile {
  id: string;
  name: string;
  email: string;
  preferredStyle?: string[];
  defaultLuggageType?: string;
}
