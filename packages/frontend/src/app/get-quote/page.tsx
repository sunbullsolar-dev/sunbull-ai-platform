'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { apiClient } from '@/lib/api';
import { Upload, Check } from 'lucide-react';

const schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
  address: z.string().min(5, 'Please enter a valid address'),
  state: z.string().min(2, 'Please select a state'),
  utilityProvider: z.string().min(1, 'Please select a utility provider'),
  monthlyBill: z.number().min(10, 'Bill must be at least $10'),
  billUnit: z.enum(['dollar', 'kwh']),
  tcpaConsent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the TCPA consent',
  }),
});

type FormData = z.infer<typeof schema>;

const states = [
  { value: 'CA', label: 'California' },
  { value: 'TX', label: 'Texas' },
  { value: 'NY', label: 'New York' },
  { value: 'FL', label: 'Florida' },
];

const utilityProvidersByState: Record<string, { value: string; label: string }[]> = {
  CA: [
    { value: 'SCE', label: 'Southern California Edison' },
    { value: 'PG&E', label: 'Pacific Gas & Electric' },
    { value: 'SDGE', label: 'San Diego Gas & Electric' },
  ],
  TX: [
    { value: 'TXU', label: 'TXU Energy' },
    { value: 'NRG', label: 'NRG Energy' },
  ],
  NY: [
    { value: 'PSEG', label: 'Public Service Enterprise Group' },
    { value: 'Con Ed', label: 'Consolidated Edison' },
  ],
  FL: [
    { value: 'FPL', label: 'Florida Power & Light' },
    { value: 'TECO', label: 'Tampa Electric Co.' },
  ],
};

const GetQuotePage: React.FC = () => {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [utilityFile, setUtilityFile] = useState<File | null>(null);
  const [selectedState, setSelectedState] = useState('CA');

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      state: 'CA',
      utilityProvider: 'SCE',
      billUnit: 'dollar',
      monthlyBill: 150,
      tcpaConsent: false,
    },
  });

  const state = watch('state');
  const billUnit = watch('billUnit');
  const monthlyBill = watch('monthlyBill');

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.createLead({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        state: data.state,
        utilityProvider: data.utilityProvider,
        monthlyBill: data.monthlyBill,
        billUnit: data.billUnit,
        utilityBillFile: utilityFile || undefined,
        tcpaConsent: data.tcpaConsent,
      });

      const leadId = response.data?.data?.id || response.data?.id;
      if (!leadId) {
        throw new Error('Lead created but no ID returned');
      }
      const genResp = await apiClient.generateProposal(leadId);
      const proposalId =
        genResp.data?.data?.id ||
        genResp.data?.data?.proposalId ||
        genResp.data?.id;
      if (!proposalId) {
        throw new Error('Proposal generation did not return an ID');
      }
      router.push(`/proposal/${proposalId}`);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'An unexpected error occurred';
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-bebas text-4xl sm:text-5xl text-sun tracking-widest mb-4">
              GET YOUR QUOTE
            </h1>
            <p className="text-gray-400">
              Just 120 seconds to your personalized solar proposal
            </p>
          </div>

          {/* Form Card */}
          <Card className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Full Name */}
              <Input
                label="Full Name"
                subLabel="How should we address you?"
                placeholder="John Smith"
                {...register('fullName')}
                error={errors.fullName?.message}
              />

              {/* Email */}
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                {...register('email')}
                error={errors.email?.message}
              />

              {/* Phone */}
              <Input
                label="Mobile Phone"
                type="tel"
                placeholder="(555) 123-4567"
                {...register('phone')}
                error={errors.phone?.message}
              />

              {/* Address */}
              <Input
                label="Property Address"
                placeholder="123 Sunny St, Los Angeles, CA 90001"
                {...register('address')}
                error={errors.address?.message}
              />

              {/* State */}
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <Select
                    label="State"
                    options={states}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setSelectedState(e.target.value);
                    }}
                    error={errors.state?.message}
                  />
                )}
              />

              {/* Utility Provider */}
              <Controller
                name="utilityProvider"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Utility Provider"
                    options={
                      utilityProvidersByState[selectedState] || []
                    }
                    {...field}
                    error={errors.utilityProvider?.message}
                  />
                )}
              />

              {/* Monthly Bill */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Monthly Bill Amount</label>
                  <div className="flex gap-2">
                    {['dollar', 'kwh'].map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => {
                          const controller = register('billUnit');
                          // Toggle the unit by updating the form
                          document
                            .querySelector(
                              `input[value="${unit === 'dollar' ? 'kwh' : 'dollar'}"]`
                            )
                            ?.dispatchEvent(new Event('change', { bubbles: true }));
                        }}
                        className={`text-xs px-2 py-1 rounded transition-colors ${
                          billUnit === unit
                            ? 'bg-sun text-dark-bg'
                            : 'bg-surface border border-border text-gray-300'
                        }`}
                      >
                        {unit === 'dollar' ? '$' : 'kWh'}
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  type="number"
                  placeholder={billUnit === 'dollar' ? '150' : '1200'}
                  min="0"
                  {...register('monthlyBill', { valueAsNumber: true })}
                  error={errors.monthlyBill?.message}
                />
              </div>

              {/* Utility Bill Upload (Optional) */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Utility Bill (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setUtilityFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="utility-file"
                  />
                  <label
                    htmlFor="utility-file"
                    className="flex items-center justify-center gap-2 px-4 py-6 bg-surface-2 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-sun transition-colors"
                  >
                    <Upload className="w-5 h-5 text-sun" />
                    <div className="text-center">
                      {utilityFile ? (
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">
                            {utilityFile.name}
                          </span>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-300">
                            Drop your bill or click to upload
                          </p>
                          <p className="text-xs text-gray-500">PDF or image file</p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* TCPA Consent */}
              <div className="bg-surface-2 rounded-lg border border-border p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('tcpaConsent')}
                    className="mt-1 w-4 h-4 accent-sun"
                  />
                  <span className="text-xs text-gray-400">
                    By checking this box, you agree that Sunbull AI and its partners may
                    contact you at the number above regarding your solar inquiry, including
                    via autodialed or pre-recorded calls/texts. This is in accordance with
                    the TCPA. Message and data rates may apply.
                  </span>
                </label>
                {errors.tcpaConsent && (
                  <p className="mt-2 text-xs text-red-400">
                    {errors.tcpaConsent.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                fullWidth
                size="lg"
                type="submit"
                isLoading={submitting}
              >
                Get My Solar Proposal
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Takes about 2 minutes. No strings attached.
              </p>
            </form>
          </Card>

          {/* Info Section */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Fast',
                desc: 'Get your proposal in seconds, not weeks',
              },
              {
                title: 'Accurate',
                desc: 'AI analyzes your roof and utility rates',
              },
              {
                title: 'Private',
                desc: 'We never sell your info to third parties',
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card>
                  <h3 className="font-bebas text-lg text-sun tracking-wide mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GetQuotePage;
