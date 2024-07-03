import React from "react";
import { Path } from "@shopify/react-native-skia";
import { useLinePath, PointsArray } from "victory-native";

interface MyCustomLineProps {
  points: PointsArray;
  strokeWidth?: number;
}

const MyCustomLine: React.FC<MyCustomLineProps> = ({
  points,
  strokeWidth = 3,
}) => {
  const getColorFromSlope = (currentY: number, nextY: number) => {
    return nextY > currentY ? "green" : "orange";
  };

  const segments = points.map((point, index) => {
    if (index === points.length - 1) return null;

    const nextPoint = points[index + 1];

    const segment = [point, nextPoint];
    const color = getColorFromSlope(
      point.yValue as number,
      nextPoint.yValue as number
    );

    const { path } = useLinePath(segment, { curveType: "natural" });

    return (
      <Path
        key={index}
        path={path}
        style="stroke"
        strokeWidth={strokeWidth}
        color={color}
      />
    );
  });

  return <>{segments}</>;
};

export default MyCustomLine;
