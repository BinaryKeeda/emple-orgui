import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../config/config";
import { useQuery } from "@tanstack/react-query";
import { Button, CircularProgress } from "@mui/material";
import { useSnackbar } from "notistack";
import { CloudDownload } from "@mui/icons-material";
import { Link } from "react-router-dom";

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

// -----------------------------
// Fetch Function
// -----------------------------
const fetchTestPreview = async ({
  slug,
  id,
  page,
}: {
  slug: string;
  id: string;
  page: number;
}) => {
  const res = await axios.get<ApiResponse>(
    `${BASE_URL}/api/campus/test/submissions/${slug}/${id}`,
    {
      params: { page },
      withCredentials: true,
    }
  );
  return res.data;
};

// -----------------------------
// Component
// -----------------------------
const TestPreview: React.FC = () => {
  const { slug, id } = useParams<{ slug: string; id: string }>();
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // React Query for fetching submissions
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["testPreview", slug, id, page],
    queryFn: () =>
      fetchTestPreview({
        slug: slug as string,
        id: id as string,
        page,
      }),
    enabled: !!slug && !!id,
    staleTime: 1000 * 60 * 5,
  });

  // -----------------------------
  // Excel Download Handler
  // -----------------------------
  const handleDownloadExcel = async () => {
    if (!slug || !id) return;
    setDownloading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/campus/test/sections/download/${slug}/${id}`,
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
      a.download = `test_submissions_${slug}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      enqueueSnackbar("Excel exported successfully!", {
        variant: "success",
      });
    } catch (error) {
      console.error("Error downloading Excel:", error);
      enqueueSnackbar("Failed to export Excel", { variant: "error" });
    } finally {
      setDownloading(false);
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  if (isLoading)
    return <div className="text-center py-10">Loading...</div>;

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Test Submissions</h2>

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

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="w-full text-sm text-left border border-gray-200">
          <thead className="bg-gray-50 text-gray-700 text-sm">
            <tr>
              <th className="px-4 py-3 border-b border-b-gray-200">Name</th>
              <th className="px-4 py-3 border-b border-b-gray-200">Email</th>
              <th className="px-4 py-3 border-b border-b-gray-200">Score</th>
              <th className="px-4 py-3 border-b border-b-gray-200">Attempt</th>
              <th className="px-4 py-3 border-b border-b-gray-200">
                Submitted At
              </th>
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
                <td className="px-4 py-4 border-b border-b-gray-50">
                  {s.score}
                </td>
                <Link to={s._id}>
                  <td className="px-4 py-4 border-b border-b-gray-50">
                    {s.attemptNo}
                  </td>
                </Link>
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
  );
};

export default TestPreview;
