import { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "./problem/layout/Sidebar";
import AddBasicDetails from "./problem/AddBasicDetails";
import AddLanguages from "./problem/AddLanguages";
import AddMetaData from "./problem/AddMeta";
import AddTestCases from "./problem/AddTestCases";
import { useParams } from "react-router-dom";
import { useProblemDetails } from "./problem/hooks/useGetProblem";


export default function QuestionEditor() {
    const [activeStep, setActiveStep] = useState(0);
    const { problemId } = useParams<string>();
    const { problem } = useProblemDetails();
    return (
        <Box sx={{ display: "flex", height: "calc(100vh - 66px)" }}>
            <Sidebar activeStep={activeStep} setActiveStep={setActiveStep} />

            <Box sx={{ flex:1, px: 4 }}>
         
                {
                    activeStep == 0 &&
                    <>
                        <AddBasicDetails problem={problem ?? null} problemId={problemId} setActiveStep={setActiveStep} />
                    </>
                }
                {
                    activeStep == 1 &&
                    <>
                        <AddLanguages problemId={problemId} setActiveStep={setActiveStep} />
                    </>
                }
                {
                   problemId && activeStep == 2 &&
                    <>
                        <AddMetaData problemId={problemId } setActiveStep={setActiveStep} />
                    </>
                }
                {
                    activeStep == 3 &&
                    <>
                        <AddTestCases problemId={problemId} setActiveStep={setActiveStep} />
                    </>
                }
            </Box>
        </Box>
    );
}
