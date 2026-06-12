'use client';

import { useState } from 'react';
import { HeroSection } from '@/components/sections/HeroSection';
import { ExtractionResults } from '@/components/sections/ExtractionResults';
import { PersonaForm } from '@/components/sections/PersonaForm';
import { ItineraryResults } from '@/components/sections/ItineraryResults';
import { CostBreakdown } from '@/components/sections/CostBreakdown';
import { TourRecommendations } from '@/components/sections/TourRecommendations';
import { analyzeUrl, planTrip, type ExtractionData, type FullTripResult } from '@/lib/api';
import type { TravelStyle, GroupType, TravelPace } from '@/lib/mock-data';

type Tier = 'budget' | 'comfort' | 'luxury';

export default function Page() {
  const [videoUrl, setVideoUrl] = useState('');
  const [extractedTripId, setExtractedTripId] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<ExtractionData | null>(null);
  const [tripResult, setTripResult] = useState<FullTripResult | null>(null);
  const [selectedTier, setSelectedTier] = useState<Tier>('comfort');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);

  // Persona state
  const [selectedStyle, setSelectedStyle] = useState<TravelStyle | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);
  const [selectedPace, setSelectedPace] = useState<TravelPace | null>(null);
  const [selectedDays, setSelectedDays] = useState<number>(3);

  const handleGenerateTrip = async (url: string) => {
    setVideoUrl(url);
    setAnalyzeError(null);
    setIsAnalyzing(true);
    setExtractedTripId(null);
    setExtraction(null);
    setTripResult(null);

    try {
      const data = await analyzeUrl(url);
      setExtractedTripId(data.tripId);
      setExtraction(data);
      setTimeout(() => {
        document.getElementById('extraction-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: unknown) {
      setAnalyzeError(err instanceof Error ? err.message : 'Failed to analyze video');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateItinerary = async () => {
    if (!selectedStyle || !selectedGroup || !selectedPace || !videoUrl) return;

    setPlanError(null);
    setIsPlanning(true);
    setTripResult(null);

    try {
      const { data } = await planTrip(
        videoUrl,
        {
          travelStyle: selectedStyle,
          groupType: selectedGroup,
          pace: selectedPace,
          days: selectedDays,
        },
        extractedTripId ?? undefined,
        extraction ?? undefined
      );

      // Recommend tier based on travel style
      const recommended: Tier =
        selectedStyle === 'adventure' ? 'budget' :
        selectedStyle === 'relax' ? 'luxury' :
        'comfort';

      setSelectedTier(recommended);
      setTripResult(data);

      setTimeout(() => {
        document.getElementById('itinerary-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: unknown) {
      setPlanError(err instanceof Error ? err.message : 'Failed to plan trip');
    } finally {
      setIsPlanning(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <HeroSection
        onGenerateTrip={handleGenerateTrip}
        isLoading={isAnalyzing}
        error={analyzeError}
      />

      {isAnalyzing && (
        <div className="w-full border-t border-slate-200 bg-white px-4 py-16 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <div className="flex justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
            <p className="text-slate-700 font-medium">Extracting places from your video...</p>
            <p className="text-sm text-slate-500">Fetching transcript and running Gemini AI extraction</p>
          </div>
        </div>
      )}

      {extraction && (
        <div id="extraction-results">
          <ExtractionResults data={extraction} />
        </div>
      )}

      {extraction && (
        <PersonaForm
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
          selectedGroup={selectedGroup}
          setSelectedGroup={setSelectedGroup}
          selectedPace={selectedPace}
          setSelectedPace={setSelectedPace}
          selectedDays={selectedDays}
          setSelectedDays={setSelectedDays}
          onGenerate={handleGenerateItinerary}
          isLoading={isPlanning}
          error={planError}
        />
      )}

      {isPlanning && (
        <div className="w-full border-t border-slate-200 bg-slate-50 px-4 py-16 text-center">
          <div className="mx-auto max-w-md space-y-4">
            <div className="flex justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
            <p className="text-slate-700 font-medium">Building your personalized itinerary...</p>
            <div className="space-y-1 text-sm text-slate-500">
              <p>Geocoding places via Nominatim</p>
              <p>Finding hotels & restaurants via Overpass</p>
              <p>Clustering by day with K-Means</p>
              <p>Building Budget, Comfort & Luxury plans</p>
            </div>
          </div>
        </div>
      )}

      {tripResult && (
        <>
          <div id="itinerary-results">
            <ItineraryResults
              result={tripResult}
              selectedTier={selectedTier}
              onTierChange={setSelectedTier}
            />
          </div>
          <CostBreakdown
            cost={tripResult.plans[selectedTier].cost}
            days={tripResult.persona.days}
            tier={selectedTier}
          />
          <TourRecommendations tours={tripResult.tours} />
        </>
      )}
    </main>
  );
}
