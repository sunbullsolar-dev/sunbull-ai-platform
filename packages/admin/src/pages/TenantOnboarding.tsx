/**
 * Tenant Onboarding Wizard
 * Multi-step form for creating new SaaS tenants with custom branding
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Select,
  MenuItem,
  Paper,
  Card,
  CardContent,
  Grid,
  Typography,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  Divider,
} from '@mui/material';
import { ChromePicker } from 'react-color';
import { TenantOnboardingData, PlanTier, BrandingConfig } from '@sunbull/shared/src/types/saas';

const steps = [
  'Company Info',
  'Plan Selection',
  'Branding Setup',
  'Installer Config',
  'Review & Activate',
];

interface TenantOnboardingProps {
  onComplete?: (tenantData: TenantOnboardingData) => void;
  onCancel?: () => void;
}

export const TenantOnboarding: React.FC<TenantOnboardingProps> = ({
  onComplete,
  onCancel,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<TenantOnboardingData>({
    companyName: '',
    companyDomain: '',
    contactEmail: '',
    contactPhone: '',
    selectedPlan: 'starter',
    branding: {
      logoUrl: 'https://sunbull.ai/logo.png',
      primaryColor: '#FFB800',
      secondaryColor: '#1A1A1A',
      accentColor: '#FF6B00',
      fontFamily: 'Inter',
      companyName: '',
      tagline: '',
    },
    installerSource: 'sunbull',
    useOwnInstallers: false,
    agreedToTerms: false,
  });

  const plans: Record<PlanTier, { name: string; price: number; description: string; features: string[] }> = {
    starter: {
      name: 'Starter',
      price: 3000,
      description: 'Perfect for getting started with white-label solar management',
      features: [
        'Up to 200 leads/month',
        'Basic CRM features',
        'Email notifications',
        'Standard support',
      ],
    },
    growth: {
      name: 'Growth',
      price: 8000,
      description: 'For growing solar companies with more ambition',
      features: [
        'Up to 1,000 leads/month',
        'Advanced CRM features',
        'Custom domain',
        'Advanced analytics',
        'API access',
        'Priority support',
      ],
    },
    enterprise: {
      name: 'Enterprise',
      price: 0,
      description: 'Custom solution for large solar installations',
      features: [
        'Unlimited leads',
        'Full customization',
        'Dedicated support',
        'SSO integration',
        'Custom features',
      ],
    },
  };

  // Validation helpers
  const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateDomain = (domain: string): boolean => {
    return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/.test(
      domain,
    );
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0:
        if (!formData.companyName.trim()) {
          newErrors.companyName = 'Company name is required';
        }
        if (!formData.companyDomain.trim()) {
          newErrors.companyDomain = 'Subdomain is required';
        } else if (!validateDomain(formData.companyDomain)) {
          newErrors.companyDomain = 'Invalid subdomain format';
        }
        if (!validateEmail(formData.contactEmail)) {
          newErrors.contactEmail = 'Valid email is required';
        }
        if (!formData.contactPhone.trim()) {
          newErrors.contactPhone = 'Phone number is required';
        }
        break;

      case 2:
        if (!formData.branding.companyName.trim()) {
          newErrors.companyName = 'Display name is required';
        }
        if (!formData.branding.primaryColor) {
          newErrors.primaryColor = 'Primary color is required';
        }
        if (!formData.branding.secondaryColor) {
          newErrors.secondaryColor = 'Secondary color is required';
        }
        break;

      case 4:
        if (!formData.agreedToTerms) {
          newErrors.agreedToTerms = 'You must agree to the terms';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      if (activeStep === steps.length - 1) {
        handleSubmit();
      } else {
        setActiveStep(activeStep + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBrandingChange = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      branding: {
        ...prev.branding,
        [field]: value,
      },
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        handleBrandingChange('logoUrl', base64);
        handleBrandingChange('logoB64', base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      return;
    }

    try {
      setLoading(true);

      // Call parent callback or make API request
      if (onComplete) {
        onComplete(formData);
      } else {
        // Default API call
        const response = await fetch('/api/tenants/onboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          throw new Error('Failed to create tenant');
        }

        const result = await response.json();
        console.log('Tenant created:', result);
      }
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create tenant' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, margin: '0 auto', padding: 2 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ marginBottom: 4 }}>
          Sunbull AI - Tenant Onboarding
        </Typography>

        <Stepper activeStep={activeStep} sx={{ marginBottom: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {errors.submit && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {errors.submit}
          </Alert>
        )}

        {/* Step 0: Company Info */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Company Information
            </Typography>
            <Typography color="textSecondary" paragraph>
              Tell us about your solar company
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Name"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  error={!!errors.companyName}
                  helperText={errors.companyName}
                  placeholder="e.g., Acme Solar"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Subdomain"
                  value={formData.companyDomain}
                  onChange={(e) => handleInputChange('companyDomain', e.target.value.toLowerCase())}
                  error={!!errors.companyDomain}
                  helperText={errors.companyDomain || 'Your domain: {subdomain}.sunbull.ai'}
                  placeholder="e.g., acme"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  error={!!errors.contactEmail}
                  helperText={errors.contactEmail}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  error={!!errors.contactPhone}
                  helperText={errors.contactPhone}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Company Website"
                  value={formData.companyWebsite || ''}
                  onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                  placeholder="https://example.com"
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Step 1: Plan Selection */}
        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Your Plan
            </Typography>
            <Typography color="textSecondary" paragraph>
              Choose the plan that fits your needs
            </Typography>

            <Grid container spacing={2}>
              {(Object.entries(plans) as Array<[PlanTier, typeof plans.starter]>).map(
                ([planId, plan]) => (
                  <Grid item xs={12} md={4} key={planId}>
                    <Card
                      sx={{
                        cursor: 'pointer',
                        border:
                          formData.selectedPlan === planId ? '2px solid #FFB800' : '1px solid #ddd',
                        backgroundColor:
                          formData.selectedPlan === planId ? '#FFF9E6' : 'transparent',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: 3,
                        },
                      }}
                      onClick={() => handleInputChange('selectedPlan', planId)}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {plan.name}
                        </Typography>

                        <Typography variant="h4" color="primary" gutterBottom>
                          {plan.price === 0 ? 'Custom' : `$${plan.price}/mo`}
                        </Typography>

                        <Typography color="textSecondary" paragraph>
                          {plan.description}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" gutterBottom>
                          Features:
                        </Typography>
                        {plan.features.map((feature, idx) => (
                          <Typography key={idx} variant="body2" sx={{ my: 0.5 }}>
                            ✓ {feature}
                          </Typography>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                ),
              )}
            </Grid>
          </Box>
        )}

        {/* Step 2: Branding Setup */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Branding & Appearance
            </Typography>
            <Typography color="textSecondary" paragraph>
              Customize your white-label platform
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Company Display Name
                </Typography>
                <TextField
                  fullWidth
                  value={formData.branding.companyName}
                  onChange={(e) => handleBrandingChange('companyName', e.target.value)}
                  error={!!errors.companyName}
                  helperText={errors.companyName}
                  placeholder="How your company appears in the app"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Tagline
                </Typography>
                <TextField
                  fullWidth
                  value={formData.branding.tagline || ''}
                  onChange={(e) => handleBrandingChange('tagline', e.target.value)}
                  placeholder="Optional tagline"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Logo
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                  }}
                >
                  {formData.branding.logoUrl && (
                    <Box
                      component="img"
                      src={formData.branding.logoUrl}
                      alt="Logo preview"
                      sx={{
                        height: 80,
                        width: 'auto',
                        objectFit: 'contain',
                        border: '1px solid #ddd',
                        padding: 1,
                      }}
                    />
                  )}
                  <Button
                    variant="outlined"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Logo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Primary Color
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <ChromePicker
                    color={formData.branding.primaryColor}
                    onChangeComplete={(color) =>
                      handleBrandingChange('primaryColor', color.hex)
                    }
                    disableAlpha
                  />
                  <TextField
                    value={formData.branding.primaryColor}
                    onChange={(e) => handleBrandingChange('primaryColor', e.target.value)}
                    size="small"
                    sx={{ width: 100 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Secondary Color
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <ChromePicker
                    color={formData.branding.secondaryColor}
                    onChangeComplete={(color) =>
                      handleBrandingChange('secondaryColor', color.hex)
                    }
                    disableAlpha
                  />
                  <TextField
                    value={formData.branding.secondaryColor}
                    onChange={(e) => handleBrandingChange('secondaryColor', e.target.value)}
                    size="small"
                    sx={{ width: 100 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Accent Color
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <ChromePicker
                    color={formData.branding.accentColor}
                    onChangeComplete={(color) =>
                      handleBrandingChange('accentColor', color.hex)
                    }
                    disableAlpha
                  />
                  <TextField
                    value={formData.branding.accentColor}
                    onChange={(e) => handleBrandingChange('accentColor', e.target.value)}
                    size="small"
                    sx={{ width: 100 }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Font Family
                </Typography>
                <Select
                  fullWidth
                  value={formData.branding.fontFamily}
                  onChange={(e) => handleBrandingChange('fontFamily', e.target.value)}
                >
                  <MenuItem value="Inter">Inter</MenuItem>
                  <MenuItem value="Roboto">Roboto</MenuItem>
                  <MenuItem value="Poppins">Poppins</MenuItem>
                  <MenuItem value="Playfair Display">Playfair Display</MenuItem>
                  <MenuItem value="Georgia">Georgia</MenuItem>
                </Select>
              </Grid>
            </Grid>

            {/* Preview */}
            <Paper
              sx={{
                mt: 3,
                p: 2,
                backgroundColor: formData.branding.secondaryColor,
                color: '#FFFFFF',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Preview
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                  marginBottom: 2,
                }}
              >
                {formData.branding.logoUrl && (
                  <Box
                    component="img"
                    src={formData.branding.logoUrl}
                    alt="Logo"
                    sx={{
                      height: 60,
                      width: 'auto',
                    }}
                  />
                )}
                <Typography variant="h6">{formData.branding.companyName}</Typography>
              </Box>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: formData.branding.primaryColor,
                  color: '#000000',
                }}
              >
                Example Button
              </Button>
            </Paper>
          </Box>
        )}

        {/* Step 3: Installer Config */}
        {activeStep === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Installer Configuration
            </Typography>
            <Typography color="textSecondary" paragraph>
              How will you manage installers on your platform?
            </Typography>

            <RadioGroup
              value={formData.installerSource}
              onChange={(e) => handleInputChange('installerSource', e.target.value)}
            >
              <FormControlLabel
                value="sunbull"
                control={<Radio />}
                label="Use Sunbull Installer Marketplace (Recommended)"
              />
              <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
                Access pre-vetted installers from our network. Sunbull handles installer
                quality, payments, and support.
              </Typography>

              <FormControlLabel
                value="tenant"
                control={<Radio />}
                label="Use Your Own Installers"
              />
              <Typography variant="body2" color="textSecondary" sx={{ ml: 4, mb: 2 }}>
                Manage your own installer network. You control installer onboarding, payments,
                and support.
              </Typography>
            </RadioGroup>

            {formData.installerSource === 'tenant' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                You will be able to set up your installer network during account setup.
              </Alert>
            )}
          </Box>
        )}

        {/* Step 4: Review & Activate */}
        {activeStep === 4 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Activate
            </Typography>
            <Typography color="textSecondary" paragraph>
              Please review your information before activating your account
            </Typography>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Company Information
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Company Name:
                    </Typography>
                    <Typography variant="body2">{formData.companyName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Subdomain:
                    </Typography>
                    <Typography variant="body2">{formData.companyDomain}.sunbull.ai</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Email:
                    </Typography>
                    <Typography variant="body2">{formData.contactEmail}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Phone:
                    </Typography>
                    <Typography variant="body2">{formData.contactPhone}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Plan
                </Typography>
                <Typography variant="body2">
                  {plans[formData.selectedPlan as PlanTier].name} -{' '}
                  {plans[formData.selectedPlan as PlanTier].price === 0
                    ? 'Custom Pricing'
                    : `$${plans[formData.selectedPlan as PlanTier].price}/month`}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Branding
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  {formData.branding.logoUrl && (
                    <Box
                      component="img"
                      src={formData.branding.logoUrl}
                      alt="Logo"
                      sx={{ height: 60, width: 'auto' }}
                    />
                  )}
                  <Box>
                    <Typography variant="body2">{formData.branding.companyName}</Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        mt: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          backgroundColor: formData.branding.primaryColor,
                          borderRadius: 1,
                          border: '1px solid #ddd',
                        }}
                      />
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          backgroundColor: formData.branding.secondaryColor,
                          borderRadius: 1,
                          border: '1px solid #ddd',
                        }}
                      />
                      <Box
                        sx={{
                          width: 30,
                          height: 30,
                          backgroundColor: formData.branding.accentColor,
                          borderRadius: 1,
                          border: '1px solid #ddd',
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.agreedToTerms}
                  onChange={(e) => handleInputChange('agreedToTerms', e.target.checked)}
                />
              }
              label="I agree to the Sunbull AI terms of service and understand the monthly subscription charges"
            />
            {errors.agreedToTerms && (
              <Typography color="error" variant="body2">
                {errors.agreedToTerms}
              </Typography>
            )}
          </Box>
        )}

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
          >
            Back
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={onCancel} variant="outlined">
              Cancel
            </Button>

            <Button
              onClick={handleNext}
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: '#FFB800',
                color: '#000000',
                '&:hover': {
                  backgroundColor: '#FF9500',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : activeStep === steps.length - 1 ? (
                'Activate Account'
              ) : (
                'Next'
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default TenantOnboarding;
