import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryChart, VictoryLine, VictoryArea, VictoryAxis, VictoryTheme, VictoryBar } from 'victory-native';
import { HistoricalWeatherData, ChartDataPoint } from '../services/weatherService';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 40;

interface WeatherChartProps {
  data: ChartDataPoint[];
  title: string;
  color: string;
  unit: string;
  type?: 'line' | 'area' | 'bar';
}

export const WeatherChart: React.FC<WeatherChartProps> = ({ 
  data, 
  title, 
  color, 
  unit, 
  type = 'line' 
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No data available</Text>
        </View>
      </View>
    );
  }

  const minValue = Math.min(...data.map(d => d.y));
  const maxValue = Math.max(...data.map(d => d.y));
  const average = data.reduce((sum, d) => sum + d.y, 0) / data.length;

  const renderChart = () => {
    const commonProps = {
      data: data,
      x: "x",
      y: "y",
      style: {
        data: { stroke: color, strokeWidth: 2 }
      }
    };

    switch (type) {
      case 'area':
        return (
          <VictoryArea
            {...commonProps}
            style={{
              data: { fill: color, fillOpacity: 0.3, stroke: color, strokeWidth: 2 }
            }}
          />
        );
      case 'bar':
        return (
          <VictoryBar
            {...commonProps}
            style={{
              data: { fill: color }
            }}
            barWidth={8}
          />
        );
      default:
        return <VictoryLine {...commonProps} />;
    }
  };

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>{title}</Text>
      
      <VictoryChart
        theme={VictoryTheme.material}
        height={200}
        width={chartWidth}
        padding={{ left: 50, right: 20, top: 20, bottom: 50 }}
      >
        <VictoryAxis
          dependentAxis
          tickFormat={(value) => `${Math.round(value)}${unit}`}
          style={{
            tickLabels: { fontSize: 10, fill: "#666" },
            grid: { stroke: "#e0e0e0", strokeWidth: 1 }
          }}
        />
        <VictoryAxis
          style={{
            tickLabels: { fontSize: 10, fill: "#666", angle: -45 },
            axis: { stroke: "#e0e0e0", strokeWidth: 1 }
          }}
        />
        {renderChart()}
      </VictoryChart>

      <View style={styles.chartStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Min</Text>
          <Text style={styles.statValue}>{Math.round(minValue)}{unit}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Avg</Text>
          <Text style={styles.statValue}>{Math.round(average)}{unit}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Max</Text>
          <Text style={styles.statValue}>{Math.round(maxValue)}{unit}</Text>
        </View>
      </View>
    </View>
  );
};

interface TemperatureChartProps {
  historicalData: HistoricalWeatherData[];
}

export const TemperatureChart: React.FC<TemperatureChartProps> = ({ historicalData }) => {
  const chartData: ChartDataPoint[] = historicalData.map((item) => ({
    x: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    y: item.temperature
  }));

  return (
    <WeatherChart
      data={chartData}
      title="Temperature Trends (Last 30 Days)"
      color="#FF6B35"
      unit="°C"
      type="area"
    />
  );
};

export const HumidityChart: React.FC<TemperatureChartProps> = ({ historicalData }) => {
  const chartData: ChartDataPoint[] = historicalData.map((item) => ({
    x: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    y: item.humidity
  }));

  return (
    <WeatherChart
      data={chartData}
      title="Humidity Levels (Last 30 Days)"
      color="#2E86AB"
      unit="%"
      type="line"
    />
  );
};

export const RainfallChart: React.FC<TemperatureChartProps> = ({ historicalData }) => {
  const chartData: ChartDataPoint[] = historicalData.map((item) => ({
    x: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    y: item.rainfall
  }));

  return (
    <WeatherChart
      data={chartData}
      title="Rainfall Pattern (Last 30 Days)"
      color="#4CAF50"
      unit="mm"
      type="bar"
    />
  );
};

export const WindSpeedChart: React.FC<TemperatureChartProps> = ({ historicalData }) => {
  const chartData: ChartDataPoint[] = historicalData.map((item) => ({
    x: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    y: item.windSpeed
  }));

  return (
    <WeatherChart
      data={chartData}
      title="Wind Speed (Last 30 Days)"
      color="#9C27B0"
      unit=" km/h"
      type="line"
    />
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    color: '#666',
    fontSize: 14,
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
