"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "A single color bar chart"

interface ChartBarSingleProps {
  data?: Array<{ month: string; value: number }>
  title?: string
  description?: string
  dataKey?: string
  label?: string
  trendPercentage?: number
  footerText?: string
}

export function ChartBarSingle({
  data,
  title = "Consent Collection",
  description = "Monthly trends",
  dataKey = "value",
  label = "Consents",
  trendPercentage = 5.2,
  footerText = "Showing total consents for the last 6 months"
}: ChartBarSingleProps) {
  const defaultData = [
    { month: "January", value: 186 },
    { month: "February", value: 305 },
    { month: "March", value: 237 },
    { month: "April", value: 173 },
    { month: "May", value: 209 },
    { month: "June", value: 214 },
  ]

  const chartData = data || defaultData
  
  const chartConfig = {
    [dataKey]: {
      label: label,
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar 
              dataKey={dataKey} 
              fill={`var(--color-${dataKey})`} 
              radius={4} 
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by {trendPercentage}% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          {footerText}
        </div>
      </CardFooter>
    </Card>
  )
}