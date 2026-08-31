export type CaseRow = {
  id: string;
  title: string;
  industry: string;
  difficulty: "easy" | "medium" | "hard";
  summary: string;
  prompt: string;
  is_published: boolean;
  created_at: string;
};

export type SessionRow = {
  id: string;
  user_id: string;
  case_id: string;
  mode: "text" | "voice";
  phase: "opening" | "structure" | "analysis" | "recommendation" | "completed";
  status: "in_progress" | "completed" | "abandoned";
  started_at: string;
  completed_at: string | null;
};

export type MessageRow = {
  id: string;
  session_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  audio_url: string | null;
  created_at: string;
};

export type FeedbackRow = {
  id: string;
  session_id: string;
  overall_score: number;
  structure_score: number;
  analysis_score: number;
  communication_score: number;
  strengths: string;
  improvements: string;
  summary: string;
  created_at: string;
};
