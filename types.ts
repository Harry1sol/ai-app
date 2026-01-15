export interface SearchParams {
  exam: string;
  level: string;
  subject: string;
  chapter: string;
}

export interface TopicOccurrence {
  topic: string;
  subTopic?: string;
  questionCount: number;
}

export interface YearData {
  year: number;
  questionCount: number;
  topics: string[];
}

export interface TopicPrediction {
  topic: string;
  probability: number;
  logic: string;
  trend: 'up' | 'down' | 'stable';
}

export interface SourceDocument {
  year: number;
  examName: string;
  sourceLabel: string;
  url: string;
}

export interface AnalysisResult {
  yearWiseData: YearData[];
  predictions: TopicPrediction[];
  sourceDocuments: SourceDocument[];
  totalQuestionsAnalyzed: number;
  mostFrequentTopic: string;
}

export interface SavedAnalysis {
  id: string;
  timestamp: number;
  params: SearchParams;
  result: AnalysisResult;
}
