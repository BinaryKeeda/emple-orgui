/**
 * Parse Aiken format text into structured question objects.
 * Supports MCQ, MSQ, and Text questions, including MARKS and NEGATIVE values.
 * Allows multi-line questions.
 */

export interface Option {
  key: string;
  text: string;
  isAnswer: boolean;
}

export interface BaseQuestion {
  question: string;
  category: 'MCQ' | 'MSQ' | 'Text';
  marks: number;
  negative: number;
}

export interface ChoiceQuestion extends BaseQuestion {
  category: 'MCQ' | 'MSQ';
  options: { text: string; isCorrect: boolean }[];
}

export interface TextQuestion extends BaseQuestion {
  category: 'Text';
  answer: string;
}

export type Question = ChoiceQuestion | TextQuestion;

/**
 * Parse Aiken format text into backend schema.
 * 
 * Example format:
 * ```
 * What is 2+2?
 * A. 3
 * B. 4
 * C. 5
 * ANSWER: B
 * MARKS: 2
 * NEGATIVE: 0.5
 * ```
 * 
 * @param text Raw Aiken format string
 * @returns Parsed question objects
 */
export function parseAikenFormat(text: string ): Question[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const questions: Question[] = [];
  let questionBuffer: string[] = [];
  let options: Option[] = [];
  let marks = 1;
  let negative = 0;
  let answerText: string | null = null;

  const flushQuestion = (): void => {
    if (questionBuffer.length === 0) return;

    const qText = questionBuffer.join('\n').trim();

    if (options.length > 0) {
      const correctOptions = options.filter((o) => o.isAnswer);
      if (correctOptions.length === 0) {
        throw new Error(`No ANSWER specified for question: "${qText}"`);
      }

      const category: 'MCQ' | 'MSQ' = correctOptions.length > 1 ? 'MSQ' : 'MCQ';

      questions.push({
        question: qText,
        category,
        marks,
        negative,
        options: options.map((o) => ({
          text: o.text,
          isCorrect: o.isAnswer,
        })),
      });
    } else if (answerText !== null) {
      questions.push({
        question: qText,
        category: 'Text',
        marks,
        negative,
        answer: answerText,
      });
    }

    // Reset buffers
    questionBuffer = [];
    options = [];
    marks = 1;
    negative = 0;
    answerText = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match option lines: A. Option text
    const matchOption = line.match(/^([A-Z])\.\s+(.*)$/);
    if (matchOption) {
      options.push({ key: matchOption[1], text: matchOption[2], isAnswer: false });
      continue;
    }

    // Match answer lines: ANSWER: B or ANSWER: A,B
    const matchAnswer = line.match(/^ANSWER:\s*(.+)$/i);
    if (matchAnswer) {
      const answerVal = matchAnswer[1].trim();

      if (options.length > 0) {
        const correctKeys = answerVal
          .split(',')
          .map((a) => a.trim().charAt(0).toUpperCase());

        correctKeys.forEach((key) => {
          const found = options.find((o) => o.key === key);
          if (!found) {
            throw new Error(
              `Invalid ANSWER key '${key}' in question "${questionBuffer.join(' ')}"`
            );
          }
          found.isAnswer = true;
        });
      } else {
        // Text question answer
        answerText = answerVal;
      }
      continue;
    }

    // Match marks: MARKS: 2
    const matchMarks = line.match(/^MARKS:\s*([0-9]+(?:\.[0-9]+)?)$/i);
    if (matchMarks) {
      marks = parseFloat(matchMarks[1]);
      continue;
    }

    // Match negative: NEGATIVE: -0.5
    const matchNegative = line.match(/^NEGATIVE:\s*(-?[0-9]+(?:\.[0-9]+)?)$/i);
    if (matchNegative) {
      negative = parseFloat(matchNegative[1]);
      // End of block — flush question
      flushQuestion();
      continue;
    }

    // Normal question text (supports multi-line)
    questionBuffer.push(line);
  }

  // Flush last question (if not ended with NEGATIVE)
  flushQuestion();

  return questions;
}
