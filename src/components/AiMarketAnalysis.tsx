import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AiMarketAnalysisProps {
  fxData: any;
  timePeriod: string;
}

export const AiMarketAnalysis = ({ fxData, timePeriod }: AiMarketAnalysisProps) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-market-analysis', {
        body: { fxData, timePeriod }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "AI market insights generated successfully",
      });
    } catch (error: any) {
      console.error('AI analysis error:', error);
      toast({
        title: "Analysis Error",
        description: error.message || "Failed to generate AI analysis",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-elevated">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <CardTitle className="text-xl font-bold text-primary">AI Market Analysis</CardTitle>
          </div>
          <Button 
            onClick={generateAnalysis} 
            disabled={loading}
            size="sm"
            className="gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Insights
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Powered by advanced AI models analyzing FX market trends
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {!analysis && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Click "Generate Insights" to get AI-powered market analysis</p>
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        )}
        {analysis && !loading && (
          <div className="prose prose-sm max-w-none">
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{analysis}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
