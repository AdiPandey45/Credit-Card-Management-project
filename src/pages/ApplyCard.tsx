import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApplyCardForm from '../components/forms/ApplyCardForm';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const ctaMessages = {
  "primary_cta": "Submit Application",
  "secondary_cta": "Save & Continue Later",
  "success_title": "Application Submitted Successfully!",
  "success_description": "Your application is being processed. We'll notify you within 24 hours with the decision.",
  "error_title": "Submission Failed",
  "error_description": "Please check your details and try again."
};

export default function ApplyCard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success/failure
      const isSuccess = Math.random() > 0.3;
      
      if (isSuccess) {
        setSubmitStatus('success');
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Apply for Your Credit Card
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Join thousands of satisfied customers and get instant approval for your new credit card
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {submitStatus === 'idle' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <ApplyCardForm onSubmit={handleSubmit} />
          </motion.div>
        )}

        {submitStatus === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-12 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {ctaMessages.success_title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              {ctaMessages.success_description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setSubmitStatus('idle')}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded hover:shadow transition-all duration-200"
              >
                Submit Another Application
              </button>
              <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        )}

        {submitStatus === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl p-12 shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <XCircleIcon className="w-10 h-10 text-red-600 dark:text-red-400" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {ctaMessages.error_title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              {ctaMessages.error_description}
            </p>
            <button
              onClick={() => setSubmitStatus('idle')}
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded hover:shadow transition-all duration-200"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}