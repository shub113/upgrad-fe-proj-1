import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { apiService } from '../../common/apiService';
import { API_ENDPOINTS } from '../../common/config';
import { useAuth } from '../../common/AuthContext';

const SORT_OPTIONS = {
  DEFAULT: 'default',
  PRICE_HIGH_TO_LOW: 'price_high_to_low',
  PRICE_LOW_TO_HIGH: 'price_low_to_high',
  NEWEST: 'newest',
};

const Products = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState(SORT_OPTIONS.DEFAULT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const searchQuery = searchParams.get('search');
        const endpoint = searchQuery
          ? `${API_ENDPOINTS.PRODUCTS.BASE}?search=${searchQuery}`
          : API_ENDPOINTS.PRODUCTS.BASE;
        
        const data = await apiService.get(endpoint);
        setProducts(data);
        setError('');
      } catch {
        setError('Failed to fetch products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const handleCategoryChange = (event, newCategory) => {
    if (newCategory !== null) {
      setSelectedCategory(newCategory);
    }
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  const handleBuyNow = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleEdit = (productId) => {
    navigate(`/products/${productId}/edit`);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await apiService.delete(`${API_ENDPOINTS.PRODUCTS.BASE}/${productToDelete.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setError('');
      navigate('/products', {
        state: { message: `Product ${productToDelete.name} deleted successfully` },
      });
    } catch {
      setError('Failed to delete product');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const getSortedProducts = () => {
    let sortedProducts = [...products];

    if (selectedCategory !== 'all') {
      sortedProducts = sortedProducts.filter(
        (product) => product.category === selectedCategory
      );
    }

    switch (sortOption) {
      case SORT_OPTIONS.PRICE_HIGH_TO_LOW:
        return sortedProducts.sort((a, b) => b.price - a.price);
      case SORT_OPTIONS.PRICE_LOW_TO_HIGH:
        return sortedProducts.sort((a, b) => a.price - b.price);
      case SORT_OPTIONS.NEWEST:
        return sortedProducts.sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
      default:
        return sortedProducts;
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

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Categories
        </Typography>
        <ToggleButtonGroup
          value={selectedCategory}
          exclusive
          onChange={handleCategoryChange}
          aria-label="product categories"
          sx={{ mb: 2, flexWrap: 'wrap' }}
        >
          <ToggleButton 
            value="all" 
            aria-label="all categories"
            sx={{
              color: 'text.primary',
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              },
            }}
          >
            All
          </ToggleButton>
          {categories.map((category) => (
            <ToggleButton
              key={category}
              value={category}
              aria-label={category}
              sx={{
                color: 'text.primary',
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}
            >
              {category}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortOption}
              label="Sort By"
              onChange={handleSortChange}
            >
              <MenuItem value={SORT_OPTIONS.DEFAULT}>Default</MenuItem>
              <MenuItem value={SORT_OPTIONS.PRICE_HIGH_TO_LOW}>
                Price: High to Low
              </MenuItem>
              <MenuItem value={SORT_OPTIONS.PRICE_LOW_TO_HIGH}>
                Price: Low to High
              </MenuItem>
              <MenuItem value={SORT_OPTIONS.NEWEST}>Newest</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {getSortedProducts().map((product) => (
          <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                  transition: 'all 0.3s ease-in-out',
                },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={product.imageUrl || 'https://via.placeholder.com/200'}
                alt={product.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography gutterBottom variant="h6" component="h2">
                    {product.name}
                  </Typography>
                  {user?.isAdmin && (
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(product.id)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(product)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {product.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${product.price.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Category: {product.category}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Available: {product.availableItems}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => handleBuyNow(product.id)}
                  disabled={product.availableItems === 0}
                >
                  Buy Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete {productToDelete?.name}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Products; 