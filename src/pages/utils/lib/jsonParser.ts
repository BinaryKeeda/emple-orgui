import * as XLSX from 'xlsx';

// ✅ Define question data models
export interface Option {
  text: string;
  isCorrect: boolean;
}

export interface BaseQuestion {
  quizId: string;
  question: string;
  marks: number;
  negative: number;
  category: 'MCQ' | 'MSQ' | 'Text';
}

export interface TextQuestion extends BaseQuestion {
  category: 'Text';
  answer: string;
}

export interface ChoiceQuestion extends BaseQuestion {
  category: 'MCQ' | 'MSQ';
  options: Option[];
}

export type Question = TextQuestion | ChoiceQuestion;

// ✅ CSV / Excel to JSON parser
export const csvToJson = (file: File, quizId: string): Promise<Question[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const binaryString = e.target?.result;
        if (typeof binaryString !== 'string') {
          return reject(new Error('Invalid file content.'));
        }

        const workbook = XLSX.read(binaryString, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(
          workbook.Sheets[sheetName]
        );

        const formattedData: Question[] = jsonData.map((row, index) => {
          const question = String(row['question'] ?? '').trim();
          const marks = Number(row['marks'] ?? 0);
          const negative = Number(row['negative'] ?? 0);

          if (!question || isNaN(marks)) {
            throw new Error(`Invalid question or marks in row ${index + 1}`);
          }

          const options: Option[] = [
            { text: String(row['option1'] ?? ''), isCorrect: true },
            { text: String(row['option2'] ?? ''), isCorrect: false },
            { text: String(row['option3'] ?? ''), isCorrect: false },
            { text: String(row['option4'] ?? ''), isCorrect: false },
          ];

          return {
            quizId,
            question,
            marks,
            negative,
            category: 'MCQ',
            options,
          };
        });

        resolve(formattedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

// ✅ JSON file to standardized Question[]
export const jsonToFormattedData = (file: File, quizId: string): Promise<Question[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const content = e.target?.result;
        if (typeof content !== 'string') {
          return reject(new Error('Invalid file content.'));
        }

        const jsonData = JSON.parse(content);
        if (!Array.isArray(jsonData)) {
          return reject(new Error('JSON must be an array of questions.'));
        }

        const formattedData: any[] = jsonData.map((row, index) => {
          if (!row.question || !row.category || typeof row.marks !== 'number') {
            throw new Error(`Missing fields in question ${index + 1}`);
          }

          const common: BaseQuestion = {
            quizId,
            question: String(row.question),
            category: row.category,
            marks: Number(row.marks),
            negative: Math.abs(Number(row.negative || 0)),
          };

          if (row.category === 'Text') {
            if (!row.answer || typeof row.answer !== 'string') {
              throw new Error(`Invalid or missing answer in question ${index + 1}`);
            }
            return { ...common, answer: row.answer };
          }

          if (row.category === 'MCQ' || row.category === 'MSQ') {
            if (
              !Array.isArray(row.options) ||
              row.options.length < 2 ||
              row.options.some(
                (opt: any) => typeof opt.text !== 'string' || typeof opt.isCorrect !== 'boolean'
              )
            ) {
              throw new Error(`Invalid options in question ${index + 1}`);
            }
            return { ...common, options: row.options };
          }

          throw new Error(`Unsupported category '${row.category}' in question ${index + 1}`);
        });

        resolve(formattedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};
