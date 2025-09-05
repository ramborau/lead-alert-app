'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const data = [
  { day: 'Mon', leads: 12, conversions: 8 },
  { day: 'Tue', leads: 19, conversions: 12 },
  { day: 'Wed', leads: 15, conversions: 10 },
  { day: 'Thu', leads: 25, conversions: 18 },
  { day: 'Fri', leads: 22, conversions: 15 },
  { day: 'Sat', leads: 18, conversions: 14 },
  { day: 'Sun', leads: 16, conversions: 11 },
]

export default function LeadsChart() {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Leads Overview</CardTitle>
        <CardDescription>
          Daily leads and conversions for the past week
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="day" 
              className="text-xs"
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              className="text-xs"
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Area
              type="monotone"
              dataKey="leads"
              stroke="hsl(var(--primary))"
              fillOpacity={1}
              fill="url(#colorLeads)"
            />
            <Area
              type="monotone"
              dataKey="conversions"
              stroke="hsl(var(--secondary))"
              fillOpacity={1}
              fill="url(#colorConversions)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}