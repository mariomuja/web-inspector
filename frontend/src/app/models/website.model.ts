export interface Website {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
}

export interface WebAnalysisResult {
  siteName: string;
  siteUrl: string;
  analyzedAt: string;
  overallScore: number;
  violations: Violation[];
  recommendations: string[];
  summary: AnalysisSummary;
}

export interface Violation {
  id: string;
  ruleName: string;
  category: string;
  severity: 'error' | 'warning' | 'info';
  description: string;
  details: string;
  rationale?: string;
  impact?: string;
  source?: string;
  sourceUrl?: string;
  recommendation: string;
  examples?: string[];
  page?: string;
  element?: string;
}

export interface AnalysisSummary {
  totalRules: number;
  passedRules: number;
  failedRules: number;
  warningRules: number;
  infoRules: number;
}

