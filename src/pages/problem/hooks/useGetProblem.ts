import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../../config/config";

export interface Problem {
    _id: string;
    title: string;
    slug: string;
    difficulty: string;
    description?: string;
    tags?: string[];
    isPublic?: boolean;
    timeLimit?: number;
    memoryLimit?: number;
    points?: number;
    functionSignature: [{
        langauage: string,
        signature: string
    }],
    testCases: [{
        input:string,
        output:string,
        explanation:string
    }],
    examples?: Array<{
        input: string;
        output: string;
        explanation?: string;
    }>,
    hints:[string],
    constraints:[string],
    languagesSupported: [
        string
    ]
}

const fetchProblem = async (problemId: string): Promise<Problem> => {
    const res = await axios.get(`${BASE_URL}/api/campus/problems/${problemId}`);
    return res.data;
};

export const useProblemDetails = () => {
    const { problemId } = useParams<{ problemId: string }>();

    const {
        data: problem,
        isLoading: loading,
        error,
        refetch,
    } = useQuery({
        queryKey: ["problemDetails", problemId],
        queryFn: () => fetchProblem(problemId!),
        enabled: !!problemId, // prevents running if no id
    });

    return {
        problem,
        loading,
        error: error ? (error as any).message : null,
        refetch,
    };
};
