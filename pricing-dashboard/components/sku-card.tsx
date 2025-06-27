"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Info, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { SkuData } from "@/hooks/use-firebase"

interface SKUCardProps {
  sku: SkuData
}

export function SKUCard({ sku }: SKUCardProps) {
  const [isRationaleOpen, setIsRationaleOpen] = useState(false)

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`
  const formatPercent = (percent: number) => `${percent.toFixed(1)}%`
  // Current timestamp (since updated_at is not in our data yet)
  const formatDate = () => {
    const now = new Date()
    return now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Calculate margin percentage
  const calculateMargin = (price: number, cost: number) => {
    if (!price || !cost) return "0.0"
    return (((price - cost) / price) * 100).toFixed(1)
  }

  const getTrendIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (delta < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <div className="h-4 w-4" />
  }

  const getTrendColor = (delta: number) => {
    if (delta > 0) return "text-green-600"
    if (delta < 0) return "text-red-600"
    return "text-slate-600"
  }
  
  // Market data - some fields still use mock data per PRD
  const marketData = {
    usda_today: 0,
    seven_day_delta: 0,
    thirty_vs_ninety_delta: 0,
    one_year_delta: 0,
    // Use the actual rationale from Firebase instead of mock data
    rationale: sku.rationale || [],
  }

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">{sku.productCode}</CardTitle>
            <p className="text-slate-600 mt-1">{sku.description}</p>
          </div>
          <Badge variant="secondary" className="w-fit">
            <Clock className="h-3 w-3 mr-1" />
            Updated {formatDate()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Section A: AI Recommended Price */}
        <div className="text-center py-8 bg-gradient-to-r from-emerald-50 via-blue-50 to-indigo-50 rounded-xl border-2 border-indigo-100 shadow-inner">
          <div className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-3">
            {formatCurrency(sku.aiPrice)}
          </div>
          <div className="text-xl font-semibold text-slate-700 mb-2">AI Recommended Sales Price</div>
          <div className="text-sm text-slate-500 bg-white/60 rounded-full px-4 py-1 inline-block">
            Margin: {calculateMargin(sku.aiPrice, sku.lastCost)}%
          </div>
        </div>

        {/* Section B: Rationale (Collapsible) */}
        <Collapsible open={isRationaleOpen} onOpenChange={setIsRationaleOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between text-left h-auto py-4 border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span className="font-medium">Why this price?</span>
              </div>
              {isRationaleOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <Card className="bg-slate-50">
              <CardContent className="p-4">
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {marketData.rationale.length > 0 ? (
                    marketData.rationale.map((reason: string, index: number) => {
                      // Replace unicode arrow character with actual arrow symbol
                      const formattedReason = reason.replace(/\u2192|→/g, '→');
                      
                      return (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <p className="text-sm text-slate-700">{formattedReason}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-500">Reasoning information will be available soon.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        {/* Section C: Key Inputs Table */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Key Inputs
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cost & Pricing */}
            <Card className="border-2 border-slate-100 hover:border-indigo-200 transition-all duration-200 hover:shadow-md">
              <CardContent className="p-4">
                <h4 className="font-medium text-slate-700 mb-3">Cost & Pricing</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Last Cost:</span>
                    <span className="font-medium">{formatCurrency(sku.lastCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Current Sales Price:</span>
                    <span className="font-medium">{formatCurrency(sku.benchmarkPrice)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card className="border-2 border-slate-100 hover:border-indigo-200 transition-all duration-200 hover:shadow-md">
              <CardContent className="p-4">
                <h4 className="font-medium text-slate-700 mb-3">Inventory</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Current Inventory:</span>
                    <span className="font-medium">{sku.inventory.toLocaleString()} lbs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Weeks on Hand:</span>
                    <span className="font-medium">{sku.weeksOnHand || '0'} weeks</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gross Profit - Added Median GP% */}
            <Card className="border-2 border-slate-100 hover:border-indigo-200 transition-all duration-200 hover:shadow-md">
              <CardContent className="p-4">
                <h4 className="font-medium text-slate-700 mb-3">Gross Profit</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Recent GP:</span>
                    <span className="font-medium">{formatPercent(sku.recentGP)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Lifetime GP:</span>
                    <span className="font-medium">{formatPercent(sku.lifetimeGP)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Median GP:</span>
                    <span className="font-medium">{formatPercent(sku.medianGP)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Market Trends - Added USDA and 1 Year Delta */}
            <Card className="border-2 border-slate-100 hover:border-indigo-200 transition-all duration-200 hover:shadow-md">
              <CardContent className="p-4">
                <h4 className="font-medium text-slate-700 mb-3">Market Trends</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">USDA Today:</span>
                    {sku.USDA_TodayPrice !== undefined ? (
                      <span className="font-medium">{formatCurrency(sku.USDA_TodayPrice)}</span>
                    ) : (
                      <span className="font-medium text-slate-400">— Not available —</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">7-Day Δ:</span>
                    {sku.USDA_7d_pct_change !== undefined ? (
                      <span className={`font-medium flex items-center ${getTrendColor(sku.USDA_7d_pct_change)}`}>
                        {getTrendIcon(sku.USDA_7d_pct_change)}
                        <span className="ml-1">{formatPercent(sku.USDA_7d_pct_change)}</span>
                      </span>
                    ) : (
                      <span className="font-medium text-slate-400">— Not available —</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">30v90 Δ:</span>
                    {sku.USDA_30v90_pct_change !== undefined ? (
                      <span className={`font-medium flex items-center ${getTrendColor(sku.USDA_30v90_pct_change)}`}>
                        {getTrendIcon(sku.USDA_30v90_pct_change)}
                        <span className="ml-1">{formatPercent(sku.USDA_30v90_pct_change)}</span>
                      </span>
                    ) : (
                      <span className="font-medium text-slate-400">— Not available —</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">1 Year Δ:</span>
                    {sku.USDA_1yr_pct_change !== undefined ? (
                      <span className={`font-medium flex items-center ${getTrendColor(sku.USDA_1yr_pct_change)}`}>
                        {getTrendIcon(sku.USDA_1yr_pct_change)}
                        <span className="ml-1">{formatPercent(sku.USDA_1yr_pct_change)}</span>
                      </span>
                    ) : (
                      <span className="font-medium text-slate-400">— Not available —</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
