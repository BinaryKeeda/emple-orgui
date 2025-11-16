import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useQuery } from "@tanstack/react-query";
import { Button, CircularProgress, IconButton } from "@mui/material";
import { useSnackbar } from "notistack";
import { CloudDownload, Visibility } from "@mui/icons-material";
import { Link } from "react-router-dom";

interface User {
  name: string;
  email: string;
}
interface Submission {
  _id: string;
  userId: User;
  score: number;
  attemptNo: number;
  updatedAt: string;
}

interface Defaulter {
  _id: string;
  name: string;
  email: string;
}

interface ApiResponse {
  submissions: Submission[];
  total: number;
  totalPages: number;
  defaulters: {
    list: Defaulter[];
    total: number;
    totalPages: number;
  };
  currentPage: number;
}

// ---------------------------
// Fetch Function
// ---------------------------
const fetchExamPreview = async ({
  examId,
  page,
}: {
  examId: string;
  page: number
}) => {
  const res = await axios.get<ApiResponse>(
    `${BASE_URL}/api/exam/getall/submissions/${examId}?page=${page}&limit=10`,
    {
      withCredentials: true,
    }
  );
  return res.data;
};

// ---------------------------
// Component
// ---------------------------
const ExamPreview: React.FC = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["examPreview", slug, id, page],
    queryFn: () =>
      fetchExamPreview({
        examId: slug as string,
        page,
      }),
    enabled: !!slug && !!id,
    staleTime: 1000 * 60 * 5,
  });

  // ---------------------------
  // Excel Download Handler
  // ---------------------------
  const handleDownloadExcel = async () => {
    if (!slug || !id) return;
    setDownloading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/campus/exam/sections/download/${slug}/${id}`,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exam_submissions_${slug}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar("Excel exported successfully!", { variant: "success" });
    } catch (error) {
      console.error("Error downloading Excel:", error);
      enqueueSnackbar("Failed to export Excel", { variant: "error" });
    } finally {
      setDownloading(false);
    }
  };

  // ---------------------------
  // Render States
  // ---------------------------
  if (isLoading)
    return <div className="text-center py-10">Loading exam data...</div>;

  if (isError)
    return (
      <div className="text-center py-10 text-red-500">
        Failed to fetch exam data.
        <button
          onClick={() => refetch()}
          className="ml-2 underline text-indigo-600"
        >
          Retry
        </button>
      </div>
    );

  const submissions = data?.submissions ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="p-6 flex flex-col gap-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Exam Submissions</h2>

        <Button
          variant="contained"
          color="success"
          onClick={handleDownloadExcel}
          disabled={downloading}
          startIcon={
            downloading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <CloudDownload />
            )
          }
        >
          {downloading ? "Exporting..." : "Download Excel"}
        </Button>
      </div>

      {/* Submissions Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="w-full text-sm text-left border border-gray-200">
          <thead className="bg-gray-50 text-gray-700 text-sm">
            <tr>
              <th className="px-4 py-3 border-b">Name</th>
              <th className="px-4 py-3 border-b">Email</th>
              <th className="px-4 py-3 border-b">Attempt</th>
              <th className="px-4 py-3 border-b">Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((s) => (
              <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 border-b">{s?.userId?.name}</td>
                <td className="px-4 py-4 border-b">{s?.userId?.email}</td>
                <td className="px-4 py-4 border-b">
                  <Link to={s._id}>
                    <IconButton><Visibility /></IconButton>
                  </Link>
                </td>
                <td className="px-4 py-4 border-b">
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
  );
};

export default ExamPreview;
