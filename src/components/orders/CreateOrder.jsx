import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import { apiService } from '../../common/apiService';
import { API_ENDPOINTS } from '../../common/config';

const steps = ['Address Details', 'Order Details', 'Confirmation'];

const CreateOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [addressError, setAddressError] = useState('');

  const productDetails = location.state?.productDetails;
  const quantity = location.state?.quantity;

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await apiService.get(API_ENDPOINTS.ADDRESSES.BASE);
        setAddresses(data);
      } catch {
        setError('Failed to fetch addresses');
      }
    };

    fetchAddresses();
  }, []);

  const handleAddressSelect = (event) => {
    const selectedAddressId = event.target.value;
    setSelectedAddress(selectedAddressId);
    setAddressError('');

    // Find the selected address from the addresses array
    const address = addresses.find(addr => addr.id === selectedAddressId);
    if (address) {
      // Fill in the new address form with the selected address details
      setNewAddress({
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
      });
    }
  };

  const handleNewAddressChange = (event) => {
    const { name, value } = event.target;
    setNewAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateNewAddress = () => {
    const { street, city, state, zipCode } = newAddress;
    if (!street || !city || !state || !zipCode) {
      setAddressError('All address fields are required');
      return false;
    }
    return true;
  };

  const handleSaveAddress = async () => {
    if (!validateNewAddress()) {
      return;
    }

    try {
      setLoading(true);
      const savedAddress = await apiService.post(API_ENDPOINTS.ADDRESSES.BASE, newAddress);
      setAddresses((prev) => [...prev, savedAddress]);
      setSelectedAddress(savedAddress.id);
      setNewAddress({
        street: '',
        city: '',
        state: '',
        zipCode: '',
      });
      setAddressError('');
      setError('');
    } catch {
      setError('Failed to save address');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!selectedAddress) {
        setAddressError('Please select address!');
        return;
      }
      setAddressError('');
    }

    if (activeStep === 1) {
      try {
        setLoading(true);
        const orderData = {
          productId: productDetails.id,
          quantity,
          addressId: selectedAddress,
        };
        await apiService.post(API_ENDPOINTS.ORDERS.BASE, orderData);
        setOrderPlaced(true);
        setActiveStep((prev) => prev + 1);
        setTimeout(() => {
          navigate('/products', { 
            state: { message: 'Order placed successfully!' }
          });
        }, 2000);
      } catch {
        setError('Failed to place order');
      } finally {
        setLoading(false);
      }
      return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select or Add Address
            </Typography>
            {addresses.length > 0 && (
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Select Address</InputLabel>
                <Select
                  value={selectedAddress}
                  label="Select Address"
                  onChange={handleAddressSelect}
                  error={!!addressError}
                >
                  {addresses.map((address) => (
                    <MenuItem key={address.id} value={address.id}>
                      {`${address.street}, ${address.city}, ${address.state} ${address.zipCode}`}
                    </MenuItem>
                  ))}
                </Select>
                {addressError && (
                  <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                    {addressError}
                  </Typography>
                )}
              </FormControl>
            )}
            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
              Add New Address
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street"
                  name="street"
                  value={newAddress.street}
                  onChange={handleNewAddressChange}
                  required
                  error={!!addressError && !newAddress.street}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={newAddress.city}
                  onChange={handleNewAddressChange}
                  required
                  error={!!addressError && !newAddress.city}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  name="state"
                  value={newAddress.state}
                  onChange={handleNewAddressChange}
                  required
                  error={!!addressError && !newAddress.state}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  name="zipCode"
                  value={newAddress.zipCode}
                  onChange={handleNewAddressChange}
                  required
                  error={!!addressError && !newAddress.zipCode}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleSaveAddress}
                  disabled={loading}
                >
                  Save Address
                </Button>
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1">
                    Product: {productDetails?.name}
                  </Typography>
                  <Typography variant="subtitle1">
                    Quantity: {quantity}
                  </Typography>
                  <Typography variant="subtitle1">
                    Total Price: ${(productDetails?.price * quantity).toFixed(2)}
                  </Typography>
                  <Typography variant="subtitle1">
                    Shipping Address: {
                      addresses.find(addr => addr.id === selectedAddress)?.street
                    }
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Your order is confirmed.
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Thank you for your purchase!
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Create Order
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={activeStep === steps.length - 1 || orderPlaced}
          >
            {activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateOrder; 