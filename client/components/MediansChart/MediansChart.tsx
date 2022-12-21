import React, { useEffect, useMemo, useRef, useState } from "react";

import { AxisBottom, AxisLeft } from "@visx/axis";
import { Bar } from "@visx/shape";
import { Group } from "@visx/group";
import { scaleBand } from "@visx/scale";

import { CourseMedian } from "../pages/Course/Course";

export interface MediansChartProps {
  medians: CourseMedian[];
}

const gradeToLabel = (g: number): string => {
  switch (g) {
    case 12:
      return "A";
    case 11:
      return "A-";
    case 10:
      return "B+";
    case 9:
      return "B";
    case 8:
      return "B-";
    case 7:
      return "C+";
    case 6:
      return "C";
    case 5:
      return "C-";
    case 4:
      return "";
    case 3:
      return "D";
    default:
      return "";
  }
};

const MediansChart = ({ medians }: MediansChartProps) => {
  const [chartWidth, setChartWidth] = useState(250);
  const targetRef = useRef<HTMLDivElement>(null);

  const chartHeight = 250;
  const margins = { top: 20, right: 20, bottom: 30, left: 40 };

  const xMax = chartWidth - margins.left;
  const yMax = chartHeight - margins.top - margins.bottom;

  useEffect(() => {
    if (!targetRef.current) return;
    setChartWidth(targetRef.current.clientWidth ?? 250);
  }, []);

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, xMax],
        round: true,
        domain: medians.map((m) => m.termCode),
        padding: 0.16,
      }),
    [xMax, medians]
  );

  const yScale = useMemo(
    () =>
      scaleBand<string>({
        range: [yMax, 0],
        round: true,
        domain: ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D"],
        reverse: true,
      }),
    [yMax]
  );

  return (
    <div ref={targetRef} id="median-chart-section" style={{ width: "100%" }}>
      <svg width={chartWidth} height={chartHeight} fill="white">
        <rect width={chartWidth} height={chartHeight} />
        <Group
          top={(margins.top + margins.bottom) / 2}
          left={margins.left}
          spacing={4}
        >
          {medians.map((m) => {
            const label = m.termCode;
            const barWidth = xScale.bandwidth();
            const barHeight = yMax - (yScale(gradeToLabel(m.medianGrade)) ?? 0);
            const barX = xScale(label);
            const barY = yMax - barHeight;

            return (
              <Bar
                key={label}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill="#00693e"
              />
            );
          })}
          <AxisBottom
            numTicks={medians.length}
            top={yMax}
            scale={xScale}
            hideAxisLine
            tickLabelProps={() => ({
              fill: "black",
              fontSize: 11,
              textAnchor: "middle",
            })}
          />
          <AxisLeft
            scale={yScale}
            numTicks={9}
            // top={0}
            tickLabelProps={(e) => ({
              fill: "black",
              fontSize: 11,
              textAnchor: "start",
              x: -24,
              y: (yScale(e) ?? 0) + 12,
            })}
          />
        </Group>
      </svg>
    </div>
  );
};

export default MediansChart;
