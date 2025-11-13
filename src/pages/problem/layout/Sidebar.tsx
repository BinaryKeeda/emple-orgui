import { Box, Typography, Button } from "@mui/material";

const steps = [
  { id: "basic", label: "Question Details" },
  { id: "languages", label: "Languages" },
  { id: "stubs", label: "Constraints" },
  { id: "testcases", label: "Testcases" },
];

export default function Sidebar({ activeStep, setActiveStep }:any) {
  return (
    <Box
      sx={{
        width: 250,
        border: "1px solid #e0e0e0",
        p: 3,
        bgcolor: "#fafafa",
        height:"max-content"
      }}
    >
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Add Question
      </Typography>

      {steps.map((step, index) => (
        <Box
          key={step.id}
          onClick={() => setActiveStep(index)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            p: 1,
            mb: 1,
            borderRadius: 1,
            cursor: "pointer",
            bgcolor: activeStep === index ? "#e8f5e9" : "transparent",
            color: activeStep === index ? "#2e7d32" : "#333",
            "&:hover": { bgcolor: "#f5f5f5" },
          }}
        >
          <Typography
            sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: "1.5px solid",
              borderColor: activeStep === index ? "#2e7d32" : "#bdbdbd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            {index + 1}
          </Typography>
          <Typography fontSize={15}>{step.label}</Typography>
        </Box>
      ))}

      <Box
        sx={{
          mt: 4,
          p: 2,
          border: "1px solid #ddd",
          borderRadius: 2,
          bgcolor: "#fff",
        }}
      >
        <Typography variant="subtitle2" fontWeight={600}>
          Quality review
        </Typography>
        <Typography variant="body2" color="text.secondary">
          3–15 test cases are recommended
        </Typography>
        <Button
          variant="text"
          size="small"
          sx={{ mt: 1, textTransform: "none" }}
        >
          Add test cases
        </Button>
      </Box>
    </Box>
  );
}
