/**
 * Type definitions for the content generation system
 */

export type StyleType = "allison" | "ines" | "rita" | "blend";

export interface Idea {
  id: string;
  title: string;
  style: StyleType;
  audience: string;
  angle: string;
  hookExample: string;
  structure: string[];
}

export interface GenerateIdeasRequest {
  style: StyleType;
  n: number;
}

export interface GenerateIdeasResponse {
  ideas: Idea[];
}

export interface GenerateArticlesRequest {
  ideas: Idea[];
}

export interface GeneratedArticle {
  ideaId: string;
  title: string;
  text: string;
}

export interface GenerateArticlesResponse {
  articles: GeneratedArticle[];
}

export interface ProfileData {
  adi: string;
  allison: string;
  ines: string;
  rita: string;
}
