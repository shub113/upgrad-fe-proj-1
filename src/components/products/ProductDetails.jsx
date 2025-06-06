import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TextField,
  Button,
} from '@mui/material';
import { apiService } from '../../common/apiService';
import { API_ENDPOINTS } from '../../common/config';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const data = await apiService.get(`${API_ENDPOINTS.PRODUCTS.BASE}/${id}`);
        setProduct(data);
        setError('');
      } catch {
        setError('Failed to fetch product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  const handleQuantityChange = (event) => {
    const value = parseInt(event.target.value);
    if (value > 0 && value <= product.availableItems) {
      setQuantity(value);
    }
  };

  const handleBuyNow = () => {
    navigate('/orders/create', {
      state: {
        productDetails: product,
        quantity,
      },
    });
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

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          Product not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                width: '100%',
                height: 400,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'grey.100',
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <Typography variant="h6" color="text.secondary">
                  No image available
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" gutterBottom>
                {product.name}
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                ${product.price.toFixed(2)}
              </Typography>
              <Typography variant="body1" paragraph>
                {product.description}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Category: {product.category}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Manufacturer: {product.manufacturer}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Available Items: {product.availableItems}
              </Typography>
            </Box>

            <Box sx={{ mt: 4 }}>
              <TextField
                type="number"
                label="Quantity"
                value={quantity}
                onChange={handleQuantityChange}
                inputProps={{
                  min: 1,
                  max: product.availableItems,
                }}
                sx={{ width: 100, mr: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 2 }}
                disabled={product.availableItems === 0}
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ProductDetails; 