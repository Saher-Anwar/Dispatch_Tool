import { useState, useEffect } from "react";
import {
  FormControl,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Box,
  Chip
} from "@mui/material";
import { Person } from "@mui/icons-material";
import { searchAgents } from "../api/crud";
import { findLatLong } from "../api/location_conversion";

interface Agent {
  distance: string;
  agentId: string;
  name: string;
}

interface Props {
  bookingId: number;
  currentAgentName?: string | null;
  customerAddress: string;
  customerLatitude?: number | null;
  customerLongitude?: number | null;
  bookingDate: string;
  bookingTime: string;
  onAssignAgent: (bookingId: number, agentId: string) => void;
  disabled?: boolean;
}

export default function AgentAssignmentDropdown({
  bookingId,
  currentAgentName,
  customerAddress,
  customerLatitude,
  customerLongitude,
  bookingDate,
  bookingTime,
  onAssignAgent,
  disabled = false
}: Props) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Search for nearby agents using customer coordinates
  const searchNearbyAgents = async () => {
    setLoading(true);
    try {
      // Check if coordinates are available
      if (!customerLatitude || !customerLongitude) {
        console.error("Customer coordinates not available");
        setAgents([]);
        setSearchPerformed(true);
        return;
      }

      console.log(`Searching agents near coordinates: ${customerLatitude}, ${customerLongitude}`);

      // Search for agents using the customer's coordinates
      const data = await searchAgents({
        latitude: customerLatitude.toString(),
        longitude: customerLongitude.toString(),
        booking_date: bookingDate,
        booking_time: bookingTime,
      });
      
      console.log(`Found ${data.length} available agents`);
      setAgents(data);
      setSearchPerformed(true);
    } catch (error) {
      console.error("Error searching agents:", error);
      setAgents([]);
      setSearchPerformed(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    if (!searchPerformed) {
      searchNearbyAgents();
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAgentSelect = (agentId: string) => {
    onAssignAgent(bookingId, agentId);
    setOpen(false);
  };

  const handleUnassign = () => {
    onAssignAgent(bookingId, ""); // Pass empty string to unassign
    setOpen(false);
  };

  // Always show dropdown (whether assigned or unassigned)
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" color="text.secondary" fontWeight="600" sx={{ mb: 0.5 }}>
          Assigned to:
        </Typography>
        <FormControl size="small" fullWidth disabled={disabled}>
          <Select
            value={currentAgentName || ""}
            open={open}
            onOpen={handleOpen}
            onClose={handleClose}
            displayEmpty
            renderValue={(value) => {
              if (!value) {
                return (
                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                    Unassigned - Click to assign
                  </Typography>
                );
              }
              return (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip 
                    label={value}
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ fontSize: '0.75rem', height: 20 }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    (Click to change)
                  </Typography>
                </Box>
              );
            }}
            sx={{
              '& .MuiSelect-select': {
                py: 0.5,
                fontSize: '0.875rem',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }}
          >
            {loading ? (
              <MenuItem disabled>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2">Searching nearby agents...</Typography>
                </Box>
              </MenuItem>
            ) : agents.length === 0 && searchPerformed ? (
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  No available agents found
                </Typography>
              </MenuItem>
            ) : (
              <>
                {currentAgentName && (
                  <>
                    <MenuItem onClick={handleUnassign}>
                      <Typography variant="body2" color="error.main" fontWeight="500">
                        Unassign Agent
                      </Typography>
                    </MenuItem>
                    <MenuItem disabled>
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Available agents nearby:
                      </Typography>
                    </MenuItem>
                  </>
                )}
                {agents.map((agent) => (
                  <MenuItem
                    key={agent.agentId}
                    value={agent.agentId}
                    onClick={() => handleAgentSelect(agent.agentId)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Typography variant="body2" fontWeight="500">
                        {agent.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {agent.distance} km
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </>
            )}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}