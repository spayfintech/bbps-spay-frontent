import React from "react";
import Chart from "react-apexcharts";

function BarChart({
  chartId,
  chartCategories,
  chartName,
  dataArray,
  chartType = "line",
}) {
  const options = {
    chart: {
      id: chartId || "defaultChart",

      toolbar: {
        show: false,
      },

      zoom: {
        enabled: false,
      },

      sparkline: {
        enabled: false,
      },
    },

    /* COLORS */
    colors: ["#2563EB"],

    /* SMOOTH LINE */
    stroke: {
      curve: "smooth",
      width: 4,
    },

    /* GRID */
    grid: {
      borderColor: "#EEF2F7",
      strokeDashArray: 5,
      padding: {
        left: 10,
        right: 10,
        top: 0,
        bottom: 0,
      },
    },

    /* X AXIS */
    xaxis: {
      categories: chartCategories || [],

      labels: {
        show: true,

        style: {
          colors: "#64748B",
          fontSize: "12px",
          fontWeight: 500,
        },
      },

      axisBorder: {
        show: false,
      },

      axisTicks: {
        show: false,
      },

      tooltip: {
        enabled: false,
      },
    },

    /* Y AXIS */
    yaxis: {
      labels: {
        style: {
          colors: "#94A3B8",
          fontSize: "11px",
        },

        formatter: (value) => {
          return `₹${value / 1000}k`;
        },
      },
    },

    /* MARKERS */
    markers: {
      size: 5,

      colors: ["#2563EB"],

      strokeColors: "#fff",

      strokeWidth: 2,

      hover: {
        size: 7,
      },
    },

    /* AREA FILL */
    fill: {
      type: "gradient",

      gradient: {
        shadeIntensity: 1,

        opacityFrom: 0.18,

        opacityTo: 0.02,

        stops: [0, 90, 100],
      },
    },

    /* DATA LABELS */
    dataLabels: {
      enabled: false,
    },

    /* TOOLTIP */
    tooltip: {
      theme: "light",

      style: {
        fontSize: "12px",
      },

      y: {
        formatter: (value) => `₹${value}`,
      },
    },

    /* LEGEND */
    legend: {
      show: false,
    },
  };

  const series = [
    {
      name: chartName || "Revenue",
      data: dataArray || [],
    },
  ];

  return (
    <div className="w-full h-full">
      <Chart
        options={options}
        series={series}
        type={chartType}
        height={240}
        width="100%"
      />
    </div>
  );
}

export default BarChart;
