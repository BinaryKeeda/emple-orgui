/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Chip,
    CircularProgress,
    Box,
    Paper,
    Button,
    Stack,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddQuestionToBank from "./Quiz/AddQuestiontoBank";
import { BASE_URL } from "../config/config";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface OptionType {
    _id?: string;
    text: string;
    isCorrect: boolean;
}

interface QuestionType {
    _id?: string;
    question?: string;
    title?: string;
    category: "MCQ" | "Text" | string;
    options?: OptionType[];
    answer?: string;
}

interface BankDetailsType {
    name?: string;
    category?: string;
}

interface QuestionApiResponse {
    questions: QuestionType[];
    bankDetails: BankDetailsType;
    page: number;
    hasMore: boolean;
}

export default function AdminEditQuestionBank() {
    const { slug: bankId = "" } = useParams<{ slug: string }>();

    const [addQuestions, setAddQuestions] = useState(false);

    // SIMPLE PAGINATION STATE
    const [page, setPage] = useState(1);

    const { data, isLoading, isError, refetch } = useQuery<QuestionApiResponse>({
        queryKey: ["questionBank", bankId, page],
        queryFn: async () => {
            const res = await axios.get(
                `${BASE_URL}/api/admin/get/questionbank/questions/${bankId}?page=${page}&limit=50`,
                { withCredentials: true }
            );
            return res.data;
        },
        enabled: bankId !== "",
    });

    const bankDetails = data?.bankDetails;
    const questions = data?.questions ?? [];
    const hasMore = data?.hasMore ?? false;

    return (
        <Box mx="auto" px={2} py={4}>
            {/* HEADER SECTION */}
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    borderRadius: 3,
                    mb: 5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                {addQuestions && (
                    <AddQuestionToBank
                        open
                        onSuccess={() => {
                            setAddQuestions(false);
                            refetch();
                        }}
                        onClose={() => setAddQuestions(false)}
                        bankId={bankId}
                    />
                )}

                <Typography variant="h5" fontWeight="bold">
                    {bankDetails?.name || "Question Bank"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                    Category: {bankDetails?.category || "N/A"}
                </Typography>

                <Stack direction="row" spacing={2} mt={1}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setAddQuestions(true)}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                        Add Question
                    </Button>
                </Stack>
            </Paper>

            {/* LOADING STATE */}
            {isLoading && (
                <Box textAlign="center" py={4}>
                    <CircularProgress />
                </Box>
            )}

            {/* ERROR STATE */}
            {isError && (
                <Typography color="error" textAlign="center">
                    Failed to load questions.
                </Typography>
            )}

            {/* QUESTIONS LIST */}
            <Box display="flex" flexWrap="wrap" gap={2}>
                {questions.map((question, index) => (
                    <Box
                        key={question._id || index}
                        flex="1 1 calc(33.33% - 16px)"
                        minWidth="300px"
                    >
                        <Accordion sx={{ borderRadius: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box
                                    display="flex"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    width="100%"
                                >
                                    <Typography fontWeight={600} flex={1} pr={1}>
                                        {question.question ||
                                            question.title ||
                                            "Untitled Question"}
                                    </Typography>

                                    <Chip
                                        label={question.category}
                                        color="primary"
                                        variant="outlined"
                                        size="small"
                                    />
                                </Box>
                            </AccordionSummary>

                            <AccordionDetails>
                                {question.category === "MCQ" ? (
                                    <Box display="flex" flexWrap="wrap" gap={1}>
                                        {question.options?.map((opt, i) => (
                                            <Box
                                                key={opt._id || i}
                                                flex="1 1 calc(50% - 8px)"
                                            >
                                                <Paper
                                                    elevation={1}
                                                    sx={{
                                                        p: 1,
                                                        bgcolor: opt.isCorrect
                                                            ? "#dcfce7"
                                                            : "#f3f4f6",
                                                        border: opt.isCorrect
                                                            ? "1px solid #22c55e"
                                                            : "1px solid #d1d5db",
                                                    }}
                                                >
                                                    {String.fromCharCode(65 + i)}. {opt.text}
                                                </Paper>
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Box mt={2}>
                                        <Typography
                                            variant="subtitle2"
                                            color="text.secondary"
                                            gutterBottom
                                        >
                                            Answer:
                                        </Typography>
                                        <Paper variant="outlined" sx={{ p: 1 }}>
                                            <Typography>
                                                {question.answer || "Not Provided"}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    </Box>
                ))}
            </Box>

            {/* PAGINATION BUTTONS */}
            <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={2}
                mt={4}
            >
                <Button
                    variant="outlined"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                >
                    Previous
                </Button>

                <Typography fontWeight="bold">Page {page}</Typography>

                <Button
                    variant="outlined"
                    disabled={!hasMore}
                    onClick={() => setPage((p) => p + 1)}
                >
                    Next
                </Button>
            </Stack>
        </Box>
    );
}
