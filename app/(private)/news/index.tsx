/**
 * News Main Screen
 * Main entry point for the news system
 * Route: /(private)/news
 */

import React from 'react';
import { MobileNewsListing } from '@/app/components/news/MobileNewsListing';

export default function NewsScreen() {
  return (
    <MobileNewsListing
      enableSearch={true}
      enableFilters={true}
    />
  );
}