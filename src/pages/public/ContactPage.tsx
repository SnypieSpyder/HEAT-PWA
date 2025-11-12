import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Button, Input, Card, Alert } from '../../components/ui';
import { EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setError('');
      setSuccess(false);
      setIsSubmitting(true);

      await addDoc(collection(db, 'contactSubmissions'), {
        ...data,
        status: 'new',
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      reset();
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-neutral-600">
            We'd love to hear from you! Send us a message and we'll get back to you soon.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <div className="p-6">
                <div className="flex items-start mb-4">
                  <MapPinIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">Location</h3>
                    <p className="text-neutral-600 text-sm">
                      Tampa Bay Area<br />
                      Florida
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <EnvelopeIcon className="h-6 w-6 text-primary-600 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-neutral-900 mb-1">Email</h3>
                    <a
                      href="mailto:info@tampabayheat.org"
                      className="text-primary-600 hover:text-primary-700 text-sm"
                    >
                      info@tampabayheat.org
                    </a>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="font-semibold text-neutral-900 mb-3">Office Hours</h3>
                <div className="space-y-2 text-sm text-neutral-600">
                  <p>Monday - Friday: 9:00 AM - 4:00 PM</p>
                  <p>Saturday: By Appointment</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                {error && (
                  <div className="mb-4">
                    <Alert type="error" message={error} onClose={() => setError('')} />
                  </div>
                )}

                {success && (
                  <div className="mb-4">
                    <Alert
                      type="success"
                      message="Thank you for your message! We'll get back to you soon."
                      onClose={() => setSuccess(false)}
                    />
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Input
                    label="Name"
                    {...register('name')}
                    error={errors.name?.message}
                    required
                  />

                  <Input
                    label="Email"
                    type="email"
                    {...register('email')}
                    error={errors.email?.message}
                    required
                  />

                  <Input
                    label="Phone"
                    type="tel"
                    {...register('phone')}
                    error={errors.phone?.message}
                  />

                  <Input
                    label="Subject"
                    {...register('subject')}
                    error={errors.subject?.message}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Message <span className="text-primary-600">*</span>
                    </label>
                    <textarea
                      {...register('message')}
                      rows={6}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" isLoading={isSubmitting}>
                    Send Message
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

