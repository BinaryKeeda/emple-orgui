import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { IconButton } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import { BASE_URL } from "../config/config";

/* ======================================================
   ------------ TYPES (Adjust if needed) ---------------
   ====================================================== */

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  _id: string;
  question: string;
  options: QuizOption[];
}

interface CodingExample {
  input: string;
  output: string;
  explanation?: string;
}

interface CodingProblem {
  _id: string;
  title: string;
  description: string;
  constraints: string[];
  examples: CodingExample[];
}

interface SectionSnapshot {
  sectionId: string;
  title: string;
  type: "quiz" | "coding";
  questions?: QuizQuestion[];
  problems?: CodingProblem[];
}

interface QuizAnswerMap {
  [questionId: string]: string; // user selected option text
}

interface CodingAnswer {
  code: string;
  total: string;
  passed: number;
}

interface CodingAnswerMap {
  [problemId: string]: CodingAnswer;
}

interface SectionResponse {
  sectionId: string;
  quizAnswers?: QuizAnswerMap[];
  codingAnswers?: CodingAnswerMap[];
}

interface TestResponseData {
  response: SectionResponse[];
  testSnapshot: SectionSnapshot[];
}

const UserTestPreview: React.FC = () => {
  const [data, setData] = useState<TestResponseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentSectionIndex, setCurrentSectionIndex] =
    useState<number>(0);

  const { attemptId: responseId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/test/response/${responseId}`,
          { withCredentials: true }
        );

        if (res.data?.status) {
          setData(res.data.data);
        }
      } catch (err: any) {
        console.error("Error fetching preview:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [responseId]);

  if (loading)
    return <p className="text-center py-6">Loading...</p>;

  if (!data)
    return (
      <p className="text-center py-6 text-red-500">No data found</p>
    );

  const { response, testSnapshot } = data;

  if (!response.length) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold">Test Preview</h2>
        <p className="mt-4 text-red-500">
          No responses available for this test.
        </p>
      </div>
    );
  }

  const currentSectionSnap = testSnapshot[currentSectionIndex];
  const currentSectionResponse = response.find(
    (s) => s.sectionId === currentSectionSnap?.sectionId
  );

  /* Pagination */
  const nextSection = () => {
    if (currentSectionIndex < testSnapshot.length - 1) {
      setCurrentSectionIndex((prev) => prev + 1);
    }
  };

  const prevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Test Preview
      </h2>

      {/* Header Pagination */}
      <div className="flex items-center justify-between mb-6 bg-white shadow p-4 rounded-xl border">
        <IconButton
          onClick={prevSection}
          disabled={currentSectionIndex === 0}
        >
          <ArrowBackIos />
        </IconButton>

        <h1 className="text-xl font-semibold text-gray-700">
          Section {currentSectionIndex + 1}:{" "}
          {currentSectionSnap?.title}
        </h1>

        <IconButton
          onClick={nextSection}
          disabled={currentSectionIndex === testSnapshot.length - 1}
        >
          <ArrowForwardIos />
        </IconButton>
      </div>

      {/* Render Correct Section */}
      <div className="bg-white shadow-md rounded-xl border p-6">
        {currentSectionSnap?.type === "quiz" && (
          <QuizSection
            section={currentSectionSnap}
            sectionResponse={currentSectionResponse}
          />
        )}

        {currentSectionSnap?.type === "coding" && (
          <CodingSection
            section={currentSectionSnap}
            sectionResponse={currentSectionResponse}
          />
        )}
      </div>

      {/* Footer Pagination */}
      <div className="flex justify-between mt-6">
        <button
          onClick={prevSection}
          disabled={currentSectionIndex === 0}
          className="px-4 py-2 rounded-md bg-gray-200 disabled:opacity-50"
        >
          Previous
        </button>

        <button
          onClick={nextSection}
          disabled={currentSectionIndex === testSnapshot.length - 1}
          className="px-4 py-2 rounded-md bg-blue-600 text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

/* ------------------------ QUIZ SECTION ------------------------ */

interface QuizSectionProps {
  section: SectionSnapshot;
  sectionResponse?: SectionResponse;
}

const QuizSection: React.FC<QuizSectionProps> = ({
  section,
  sectionResponse,
}) => {
  return (
    <div className="space-y-6">
      {section?.questions?.map((ques, idx) => {
        const userAnswer =
          sectionResponse?.quizAnswers?.[0]?.[ques._id];

        return (
          <div
            key={ques._id}
            className="bg-gray-50 p-4 rounded-xl border border-gray-200"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              {`Q${idx + 1}. ${ques.question}`}
            </h3>

            <div className="flex flex-col gap-3">
              {ques.options.map((op, opIndex) => {
                const isCorrect = op.isCorrect;
                const isUserAnswer = userAnswer === op.text;

                return (
                  <div
                    key={opIndex}
                    className={`
                      px-4 py-3 rounded-md border flex justify-between items-center
                      ${isCorrect ? "bg-green-100 border-green-400" : "bg-white"}
                      ${isUserAnswer && !isCorrect ? "bg-red-100 border-red-400" : ""}
                    `}
                  >
                    <span className="text-gray-900">{op.text}</span>

                    <div className="flex gap-3 text-sm">
                      {isCorrect && (
                        <span className="text-green-700 font-semibold">
                          ✓ Correct
                        </span>
                      )}
                      {isUserAnswer && (
                        <span className="text-blue-700 font-semibold">
                          Your Answer
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------ CODING SECTION ------------------------ */

interface CodingSectionProps {
  section: SectionSnapshot;
  sectionResponse?: SectionResponse;
}

const CodingSection: React.FC<CodingSectionProps> = ({
  section,
  sectionResponse,
}) => {
  return (
    <div className="space-y-10">
      {section.problems?.map((problem) => {
        const data =
          sectionResponse?.codingAnswers?.[0]?.[problem._id];

        return (
          <div key={problem._id} className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {problem.title}
            </h1>

            <SectionCard title="Description">
              <p className="text-gray-700 whitespace-pre-line">
                {problem.description}
              </p>
            </SectionCard>

            {problem.constraints?.length > 0 && (
              <SectionCard title="Constraints">
                <ul className="list-disc pl-6 text-gray-700">
                  {problem.constraints.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              </SectionCard>
            )}

            {problem.examples?.length > 0 && (
              <SectionCard title="Examples">
                {problem.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-100 p-4 rounded-md border mb-4"
                  >
                    <p className="font-medium text-gray-800">Input:</p>
                    <pre className="text-gray-700">{ex.input}</pre>

                    <p className="font-medium text-gray-800 mt-2">
                      Output:
                    </p>
                    <pre className="text-gray-700">{ex.output}</pre>

                    {ex.explanation && (
                      <>
                        <p className="font-medium text-gray-800 mt-2">
                          Explanation:
                        </p>
                        <pre className="text-gray-700">
                          {ex.explanation}
                        </pre>
                      </>
                    )}
                  </div>
                ))}
              </SectionCard>
            )}

            <SectionCard title="Your Submitted Code">
              <pre className="bg-black text-green-400 p-4 rounded-lg overflow-auto text-sm">
                {data?.code}
              </pre>
            </SectionCard>

            <SectionCard title="Testcases">
              <pre className="bg-gray-900 text-gray-200 p-4 rounded-lg overflow-auto text-sm">
                {data?.total}
              </pre>
            </SectionCard>

            <SectionCard title="Passed">
              <pre className="bg-gray-800 text-white p-4 rounded-lg text-sm">
                {String(data?.passed)}
              </pre>
            </SectionCard>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------ REUSABLE CARD ------------------------ */

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  children,
}) => (
  <div className="bg-white p-5 rounded-lg shadow border border-gray-200">
    <h2 className="text-xl font-semibold text-gray-700 mb-3">
      {title}
    </h2>
    {children}
  </div>
);

export default UserTestPreview;
