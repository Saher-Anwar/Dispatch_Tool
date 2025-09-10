import { useState } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  IconButton,
  Typography,
  Box
} from "@mui/material";
import Grid from '@mui/material/Grid';
import { Close } from "@mui/icons-material";
import { findLatLong } from "../api/location_conversion";
import { createBooking } from "../api/crud";
import PhoneInput from "./PhoneInput";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // Callback to refresh bookings after saving
  onLogout: () => void;
}

export default function NewAppointmentModal({ isOpen, onClose, onSave, onLogout }: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    street_number: "",
    street_name: "",
    postal_code: "",
    city: "",
    state_province: "",
    country: "",    
    date: "",
    time: "",
    type: "Roof Replacement",
  });

  const [latLon, setLatLon] = useState<{ lat: number | null, lon: number | null }>({ lat: null, lon: null });
  const [phoneValid, setPhoneValid] = useState(false);

  // ensure HH:MM:SS
  const formatTime = (time: string) => {
    if (!time) return "";
    return time.length === 5 ? `${time}:00` : time; // if "HH:MM", add ":00"
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    const key = id.replace("f-", "");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.phone && !phoneValid) {
      alert("Please enter a valid phone number");
      return;
    }

    // Get coordinates before saving
    let coordinates = latLon;
    if (!latLon.lat || !latLon.lon) {
      coordinates = await getLatLon();
      setLatLon(coordinates); // Update state for future use
    }

    // Check if coordinates are still null
    if (!coordinates.lat || !coordinates.lon) {
      alert("Unable to get location coordinates. Please check your address and try again.");
      return;
    }

    // Transform flat form into backend format
    const payload = {
      customer: {
        name: form.name,
        email: form.email,
        phone: form.phone,
      },
      location: {
        latitude: coordinates.lat,
        longitude: coordinates.lon,
        postal_code: form.postal_code,
        street_name: form.street_name,
        street_number: form.street_number,
        city: form.city,
        state_province: form.state_province,
        country: form.country,
      },
      booking: {
        booking_date: form.date,
        booking_time: formatTime(form.time),
      },
    };
    
    console.log(JSON.stringify(payload))

    try {
      await createBooking(payload);
      console.log("✅ Appointment saved");

      if (onSave) onSave();
      onClose();
    } catch (err) {
      console.error("❌ Error saving appointment:", err);
      const errorMessage = (err as Error).message || "Error saving appointment";
      
      if (errorMessage.includes("Authentication required")) {
        onLogout();
      } else {
        alert(errorMessage);
      }
    }
  };

  const getLatLon = async () => {
    try {
      const { lat, lon } = await findLatLong({
        street_number: form.street_number, 
        street_name: form.street_name, 
        postal_code: form.postal_code 
      });
      return { lat, lon };
    } catch (err) {
      console.error("Error getting coordinates:", err);
      return { lat: null, lon: null };
    }
  };

  const handlePhoneChange = (phoneValue: string) => {
    setForm((prev) => ({ ...prev, phone: phoneValue }));
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { maxHeight: '90vh' }
      }}
    >
      <form onSubmit={handleSave}>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              New Appointment
            </Typography>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Customer Fields */}
            <Grid size={{xs:12, md:6}}>
              <TextField
                id="f-name"
                label="Customer Name"
                placeholder="Bob"
                value={form.name}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <TextField
                id="f-email"
                label="Customer Email"
                type="email"
                placeholder="Bob@example.com"
                value={form.email}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <PhoneInput
                value={form.phone}
                onChange={handlePhoneChange}
                onValidityChange={setPhoneValid}
                placeholder="(123) 456-7890"
                id="f-phone"
                name="phone"
              />
            </Grid>

            {/* Address Fields */}
            <Grid size={{xs:12, md:6}}>
              <TextField
                id="f-street_number"
                label="Street Number"
                placeholder="5580"
                value={form.street_number}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <TextField
                id="f-street_name"
                label="Street Name"
                placeholder="Lacklon Lane"
                value={form.street_name}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <TextField
                id="f-city"
                label="City"
                placeholder="Bedford"
                value={form.city}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <TextField
                id="f-state_province"
                label="Province"
                placeholder="NS"
                value={form.state_province}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <TextField
                id="f-country"
                label="Country"
                placeholder="Canada"
                value={form.country}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <TextField
                id="f-postal_code"
                label="Postal Code"
                placeholder="BA4 3J7"
                value={form.postal_code}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* Date + Time */}
            <Grid size={{xs:12, md:6}}>
              <TextField
                id="f-date"
                label="Date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid size={{xs:12, md:6}}>
              <TextField
                id="f-time"
                label="Time (local)"
                type="time"
                value={form.time}
                onChange={handleChange}
                required
                fullWidth
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} color="secondary">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}