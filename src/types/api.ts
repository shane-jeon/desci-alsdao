export interface CaregiverAdvice {
  advice: Array<{
    category: string;
    recommendations: string[];
  }>;
}

export interface PatientData {
  name: string;
  age: number;
}
