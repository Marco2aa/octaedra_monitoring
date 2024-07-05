import React from "react";
import { Path } from "@shopify/react-native-skia";
import { useBarPath, PointsArray, ChartBounds } from "victory-native";

interface MyCustomBarsProps {
  points: PointsArray;
  chartBounds: ChartBounds;
  innerPadding?: number;
  customBarWidth?: number;
}

const MyCustomBars: React.FC<MyCustomBarsProps> = ({
  points,
  chartBounds,
  innerPadding = 0.1,
  customBarWidth = 10,
}) => {
  const getColorFromLatency = (yValue: number): string => {
    if (yValue > 28) {
      return "red";
    } else if (yValue > 25) {
      return "orange";
    } else {
      return "green";
    }
  };

  return (
    <>
      {points.map((point, index) => {
        const color = getColorFromLatency(point.yValue as number);
        const { path } = useBarPath(
          [point],
          chartBounds,
          innerPadding,
          undefined,
          customBarWidth
        );
        return <Path key={index} path={path} style="fill" color={color} />;
      })}
    </>
  );
};

export default MyCustomBars;
