"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SKUCard } from "@/components/sku-card"
import { useSku } from "@/hooks/use-firebase"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import React from "react"

interface SKUDetailPageProps {
  params: Promise<{ id: string }>
}

export default function SKUDetailPage({ params }: SKUDetailPageProps) {
  const router = useRouter()
  
  // Using a client component pattern that works with both new Promise-based params
  // and the current compatibility mode
  const [skuId, setSkuId] = React.useState<string>('')

  // Extract the ID once the component mounts
  React.useEffect(() => {
    const extractId = async () => {
      let id: string
      // Check if params is a Promise by testing if it has a then method
      if (typeof (params as any).then === 'function') {
        // Handle Promise-based params
        const resolvedParams = await params
        id = resolvedParams.id
      } else {
        // Handle backward compatibility
        id = (params as any).id
      }
      
      if (id) {
        console.log(`Setting SKU ID: ${id}`)
        setSkuId(id)
      }
    }
    extractId()
  }, [params])
  
  // Only pass a string to useSku after we've extracted the ID
  const { sku, loading, error } = useSku(skuId)

  // Back button component extracted for reuse
  const BackButton = () => (
    <Button
      onClick={() => router.push("/")}
      variant="outline"
      className="bg-white/80 backdrop-blur-sm border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back to Search
    </Button>
  )
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8">
            <BackButton />
          </div>
          <div className="w-full max-w-5xl mx-auto">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !sku) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center w-full max-w-md mx-auto">
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertDescription>
              {error || "SKU Not Found"}
            </AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/")} className="bg-gradient-to-r from-indigo-600 to-purple-600">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <div className="mb-8">
          <BackButton />
        </div>

        {/* SKU Details */}
        <SKUCard sku={sku} />
      </div>
    </div>
  )
}
