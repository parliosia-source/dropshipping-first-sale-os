import React from "react";
import NicheResult from "./NicheResult";
import OfferResult from "./OfferResult";
import BrandResult from "./BrandResult";
import PageResult from "./PageResult";
import CreativeResult from "./CreativeResult";
import CampaignResult from "./CampaignResult";
import TrackingResult from "./TrackingResult";
import KpiResult from "./KpiResult";

export default function AnalysisResult({ result, functionName }) {
  switch (functionName) {
    case 'analyzeNicheAndProduct':
      return <NicheResult result={result} />;
    case 'buildOfferAndPositioning':
      return <OfferResult result={result} />;
    case 'createBrandIdentity':
      return <BrandResult result={result} />;
    case 'optimizeProductPage':
      return <PageResult result={result} />;
    case 'designCreativeStrategy':
      return <CreativeResult result={result} />;
    case 'setupMetaCampaign':
      return <CampaignResult result={result} />;
    case 'setupTracking':
      return <TrackingResult result={result} />;
    case 'analyzeKPIs':
      return <KpiResult result={result} />;
    default:
      return <p className="text-sm text-muted-foreground">Résultat non disponible.</p>;
  }
}