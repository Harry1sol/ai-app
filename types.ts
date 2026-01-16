
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

// Taxonomy Types for Dropdowns
export interface TaxonomyItem {
  id: string;
  label: string;
}

export interface ChapterOption extends TaxonomyItem {}

export interface SubjectOption extends TaxonomyItem {
  chapters: ChapterOption[];
}

export interface LevelOption extends TaxonomyItem {
  subjects: SubjectOption[];
}

export interface ExamOption extends TaxonomyItem {
  levels: LevelOption[];
}
