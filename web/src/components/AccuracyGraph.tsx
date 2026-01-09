import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AnswerRecord } from '@/types/bird';

interface AccuracyGraphProps {
  answers: AnswerRecord[];
  height?: number;
  compact?: boolean;
}

export function AccuracyGraph({ answers, height = 200, compact = false }: AccuracyGraphProps) {
  // Calculate rolling accuracy at each point
  const data = answers.map((_, index) => {
    const slice = answers.slice(Math.max(0, index - 19), index + 1);
    const correct = slice.filter(a => a.correct).length;
    const accuracy = Math.round((correct / slice.length) * 100);

    return {
      question: index + 1,
      accuracy,
    };
  });

  // If fewer than 2 data points, show placeholder
  if (data.length < 2) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
        style={{ height }}
      >
        <p className="text-gray-500 text-sm">
          Answer more questions to see your accuracy trend
        </p>
      </div>
    );
  }

  // Compact sparkline mode - minimal chart
  if (compact) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Line
            type="monotone"
            dataKey="accuracy"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Full chart mode
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="question"
          label={{ value: 'Questions', position: 'insideBottom', offset: -5 }}
          stroke="#6b7280"
        />
        <YAxis
          domain={[0, 100]}
          label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft' }}
          stroke="#6b7280"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '0.5rem'
          }}
          formatter={(value: number | undefined) => value !== undefined ? [`${value}%`, 'Accuracy'] : ['', 'Accuracy']}
        />
        <Line
          type="monotone"
          dataKey="accuracy"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
