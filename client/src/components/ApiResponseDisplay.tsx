import { Typography, Box } from '@mui/material';
import * as React from 'react';

interface ApiResponseDisplayProps {
  response: any;
  title?: string;
}

export default function ApiResponseDisplay({ response, title = "Response:" }: ApiResponseDisplayProps) {
  if (!response) {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box
        component="pre"
        sx={{
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: 1,
          p: 2,
          overflow: 'auto',
          fontSize: '0.875rem',
          fontFamily: 'monospace'
        }}
      >
        {JSON.stringify(response, null, 2)}
      </Box>
    </Box>
  );
} 