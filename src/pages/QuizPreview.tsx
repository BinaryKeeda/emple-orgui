import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useQuery } from "@tanstack/react-query";

interface Submission {
  _id: string;
  attemptNo: number;
  score: number;
  submittedAt: string;
  name: string;
  email: string;
  updatedAt: string;

}

interface Defaulter {
  _id: string;
  name: string;
  email: string;
}

interface ApiResponse {
  list: Submission[];
  total: number;
  totalPages: number;
  defaulters: {
    list: Defaulter[];
    total: number;
    totalPages: number;
  };
  currentPage: number;
}

const fetchQuizPreview = async ({
  slug,
  id,
  page,
}: {
  slug: string;
  id: string;
  page: number;
}) => {
  const res = await axios.get<ApiResponse>(
    `${BASE_URL}/api/campus/quiz/submissions/${slug}/${id}`,
    {
      params: { page },
      withCredentials: true,
    }
  );
  return res.data;
};

const QuizPreview: React.FC = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["quizPreview", slug, id, page],
    queryFn: () =>
      fetchQuizPreview({
        slug: slug as string,
        id: id as string,
        page,
      }),
    enabled: !!slug && !!id,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <div className="text-center py-10">Loading...</div>;
  if (isError)
    return (
      <div className="text-center py-10 text-red-500">
        Failed to fetch data.
        <button
          onClick={() => refetch()}
          className="ml-2 underline text-indigo-600"
        >
          Retry
        </button>
      </div>
    );

  const submissions = data?.list ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="p-6 flex flex-col gap-8">
      {/* Submissions Table */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Submissions</h2>
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="w-full text-sm text-left border border-gray-200">
            <thead className="bg-gray-50 text-gray-700 text-sm">
              <tr>
                <th className="px-4 py-3 border-b border-b-gray-200">Name</th>
                <th className="px-4 py-3 border-b border-b-gray-200">Email</th>
                {/* <th className="px-4 py-3 border-b border-b-gray-200">Attempt</th> */}
                <th className="px-4 py-3 border-b border-b-gray-200">Score</th>
                <th className="px-4 py-3 border-b border-b-gray-200">Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 border-b border-b-gray-50">
                    {s.name}
                  </td>
                  <td className="px-4 py-4 border-b border-b-gray-50">
                    {s.email}
                  </td>
                  {/* <td className="px-4 py-4 border-b border-b-gray-50">{s.attemptNo}</td> */}
                  <td className="px-4 py-4 border-b border-b-gray-50">{s.score}</td>
                  <td className="px-4 py-4 border-b border-b-gray-50">
                    {new Date(s.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
              {submissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    No submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </p>
          <div className="space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 hover:bg-gray-100"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>


    </div>
  );
};

export default QuizPreview;
