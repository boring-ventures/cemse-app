/**
 * News Detail Screen
 * Displays individual news article
 * Route: /(private)/news/[id]
 */

import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { MobileNewsDetail } from '@/app/components/news/MobileNewsDetail';

export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    throw new Error('News ID is required');
  }

  return (
    <MobileNewsDetail newsId={id} />
  );
}