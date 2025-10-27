import { Close } from '@mui/icons-material';
import { Button, IconButton } from '@mui/material';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import axios from 'axios';

// ✅ Define the shape of a question
interface BaseQuestion {
  quizId: string;
  question: string;
  category: string;
  marks: number;
  negative: number;
}

interface TextQuestion extends BaseQuestion {
  answer: string;
}

interface Option {
  text: string;
  isCorrect: boolean;
}

interface MCQQuestion extends BaseQuestion {
  options: Option[];
}

type Question = TextQuestion | MCQQuestion;

// ✅ Define the props for the component
interface AddQuestionExcelProps {
  id: string;
  onSuccess: () => void;
  onError: () => void;
  setModalClose: (value: boolean) => void;
}

// ✅ Environment-safe base URL (replace if you have a config file)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AddQuestionExcel({
  onSuccess,
  onError,
  setModalClose,
  id,
}: AddQuestionExcelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    onDropAccepted: (acceptedFiles: File[]) => {
      const selected = acceptedFiles[0];
      setFile(selected);
      parseExcel(selected);
    },
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
  });

  // ✅ Parse the uploaded Excel file
  const parseExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target?.result;
      if (typeof binaryStr !== 'string') return;

      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);

      const formatted: Question[] = rows.map((row) => {
        const type = (row.category as string)?.trim();
        const base: BaseQuestion = {
          quizId: id,
          question: row.question,
          category: type,
          marks: Number(row.marks),
          negative: Number(row.negative) || 0,
        };

        if (type === 'Text') {
          return { ...base, answer: row.answer || '' };
        }

        const options: Option[] = [
          { text: row.option1, isCorrect: false },
          { text: row.option2, isCorrect: false },
          { text: row.option3, isCorrect: false },
          { text: row.option4, isCorrect: false },
        ];

        const correctIndexes =
          typeof row.correctOptions === 'string'
            ? row.correctOptions
                .split(',')
                .map((n: string) => parseInt(n.trim(), 10) - 1)
            : [];

        correctIndexes.forEach((i: number) => {
          if (options[i]) options[i].isCorrect = true;
        });

        return { ...base, options };
      });

      setPreviewData(formatted);
    };
    reader.readAsBinaryString(file);
  };

  // ✅ Download a sample Excel template
  const downloadTemplate = () => {
    const headers = [
      'question',
      'category',
      'marks',
      'negative',
      'answer',
      'option1',
      'option2',
      'option3',
      'option4',
      'correctOptions',
    ];

    const exampleRow = [
      'What is the capital of France?',
      'MCQ',
      2,
      0.5,
      '',
      'Paris',
      'London',
      'Berlin',
      'Madrid',
      1,
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    XLSX.writeFile(wb, 'quiz_template.xlsx');
  };

  // ✅ Upload parsed data to backend
  const upload = async () => {
    if (!previewData.length) return;
    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/api/admin/quiz/add/questions`,
        { quizId: id, data: previewData },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );
      onSuccess();
      setModalClose(true);
    } catch (err) {
      console.error(err);
      onError();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-opacity-25 px-36 py-24 bg-black fixed top-0 left-0 z-[2099]">
      <div className="rounded-md relative h-full w-full bg-white overflow-y-auto">
        <div className="flex justify-end p-2">
          <IconButton onClick={() => setModalClose(true)}>
            <Close />
          </IconButton>
        </div>

        <div className="mx-8 mt-4 bg-blue-50 border border-blue-300 rounded-md p-4">
          <h2 className="text-base font-semibold mb-2">Expected Excel Schema Example:</h2>
          <pre className="bg-white text-xs rounded-md p-3 overflow-x-auto whitespace-pre-wrap">
{`| question                 | category | marks | negative | answer                                   | option1  | option2 | option3 | option4 | correctOptions |
|--------------------------|----------|--------|----------|-------------------------------------------|----------|---------|---------|---------|----------------|
| What is the capital...? | MCQ      | 2      | 0.5      |                                           | Paris    | London  | Berlin  | Madrid  | 1              |
| Which are vowels?        | MSQ      | 3      | 1        |                                           | A        | B       | E       | F       | 1,3            |
| Define gravity.          | Text     | 5      | 0        | Gravity is the force...                   |          |         |         |         |                |`}
          </pre>
        </div>

        <section className="p-5 gap-5">
          <Button variant="outlined" color="secondary" onClick={downloadTemplate} sx={{ mb: 2 }}>
            Download Excel Template
          </Button>

          <div
            className="p-10 cursor-pointer flex justify-center border-dashed border-2 border-black"
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            <small>{file ? file.name : 'Upload Excel file (.xlsx/.xls)'}</small>
          </div>

          {previewData.length > 0 && (
            <div className="mt-4 bg-gray-100 rounded-md p-4 max-h-[300px] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-2">Preview Questions:</h2>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                {previewData.map((q, i) => (
                  <li key={i}>
                    <strong>Q{i + 1}:</strong> {q.question} — <i>{q.category}</i> ({q.marks} marks)
                  </li>
                ))}
              </ul>
            </div>
          )}

          {file && previewData.length > 0 && (
            <Button
              onClick={upload}
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Uploading...' : 'Validate & Upload'}
            </Button>
          )}
        </section>
      </div>
    </div>
  );
}
