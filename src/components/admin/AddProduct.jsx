import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { apiService } from '../../common/apiService';
import { API_ENDPOINTS } from '../../common/config';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    availableItems: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiService.get(API_ENDPOINTS.PRODUCTS.CATEGORIES);
        setCategories(data);
      } catch {
        setError('Failed to fetch categories');
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    if (value === 'new') {
      setProduct((prev) => ({
        ...prev,
        category: newCategory,
      }));
    } else {
      setProduct((prev) => ({
        ...prev,
        category: value,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const response = await apiService.post(API_ENDPOINTS.PRODUCTS.BASE, product);
      navigate('/products', {
        state: { message: `Product ${response.name} added successfully` },
      });
    } catch {
      setError('Failed to add product');
    } finally {
      setLoading(false);
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
    <Container sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Add Product
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Product Name"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={product.description}
            onChange={handleChange}
            required
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={product.price}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={product.category}
              label="Category"
              onChange={handleCategoryChange}
              required
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
              <MenuItem value="new">
                <em>Add New Category</em>
              </MenuItem>
            </Select>
          </FormControl>

          {product.category === 'new' && (
            <TextField
              fullWidth
              label="New Category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
          )}

          <TextField
            fullWidth
            label="Image URL"
            name="imageUrl"
            value={product.imageUrl}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Available Items"
            name="availableItems"
            type="number"
            value={product.availableItems}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={loading}
          >
            Add Product
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddProduct; 