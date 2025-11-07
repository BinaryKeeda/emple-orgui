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
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useInView } from "react-intersection-observer";

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

export default function AdminEditQuestionBank() {
    const { slug: bankId } = useParams<{ slug: string; id: string }>();
    const [addQuestions, setAddQuestions] = useState(false);
    const { ref, inView } = useInView();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        refetch,
    } = useInfiniteQuery<
        // ✅ Type Parameters
        {
            questions: QuestionType[];
            bankDetails: BankDetailsType;
            page: number;
            hasMore: boolean;
        },
        Error
    >({
        queryKey: ["questionBank", bankId],
        queryFn: async ({ pageParam }) => {
            const res = await axios.get(
                `${BASE_URL}/api/admin/get/questionbank/questions/${bankId}?page=${pageParam}&limit=10`,
                { withCredentials: true }
            );
            return res.data;
        },
        initialPageParam: 1, // ✅ REQUIRED
        getNextPageParam: (lastPage) =>
            lastPage.hasMore ? lastPage.page + 1 : undefined,
        enabled: !!bankId,
    });



    const bankDetails: BankDetailsType | undefined = data?.pages?.[0]?.bankDetails;
    const allQuestions: QuestionType[] = data
        ? data.pages.flatMap((page: any) => page.questions)
        : [];

    // Auto-fetch next page when in view
    if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
    }

    return (
        <Box  mx="auto" px={2} py={4}>
            {/* ✅ Header Section */}
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
                        // sectionId={sectionId as string}
                        open
                        onSuccess={() => {
                            setAddQuestions(false);
                            refetch();
                        }}
                        onClose={() => setAddQuestions(false)}
                        bankId={bankId || ""}
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

            {/* ✅ Questions List */}
            {isLoading && (
                <Box textAlign="center" py={4}>
                    <CircularProgress />
                </Box>
            )}

            {isError && (
                <Typography color="error" textAlign="center">
                    Failed to load questions.
                </Typography>
            )}

            <Box display="flex" flexWrap="wrap" gap={2}>
                {allQuestions.map((question, index) => (
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
                                        {question.question || question.title || "Untitled Question"}
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
                                            <Box key={opt._id || i} flex="1 1 calc(50% - 8px)">
                                                <Paper
                                                    elevation={1}
                                                    sx={{
                                                        p: 1,
                                                        bgcolor: opt.isCorrect ? "#dcfce7" : "#f3f4f6",
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
                                            <Typography>{question.answer || "Not Provided"}</Typography>
                                        </Paper>
                                    </Box>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    </Box>
                ))}
            </Box>

            {/* ✅ Infinite Scroll Loader */}
            <Box ref={ref} display="flex" justifyContent="center" py={3}>
                {isFetchingNextPage && <CircularProgress size={24} />}
            </Box>

            {!hasNextPage && !isLoading && (
                <Typography textAlign="center" mt={3} color="text.secondary">
                    No more questions.
                </Typography>
            )}
        </Box>
    );
}
