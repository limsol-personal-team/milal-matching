import React from 'react';
import { FormControlLabel, Switch, Box, Typography } from '@mui/material';
import { useActiveFilter } from '../providers/activeFilterProvider';

export default function ActiveFilterToggle() {
  const { showActiveOnly, toggleActiveFilter } = useActiveFilter();

  return (
    <Box sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, backgroundColor: '#fafafa' }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
        Filter Options
      </Typography>
      <FormControlLabel
        control={
          <Switch
            checked={showActiveOnly}
            onChange={toggleActiveFilter}
            color="primary"
          />
        }
        label="Show active users only"
      />
    </Box>
  );
} 