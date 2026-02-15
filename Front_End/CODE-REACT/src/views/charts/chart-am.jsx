import React, { useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

import Card from "../../components/Card"

const ChartAm = () => {

  am4core.options.commercialLicense = true;
  useEffect(() => {
    const chartContainer = document.getElementById('am-simple-chart');

    if (chartContainer) {
      am4core.ready(() => {
        am4core.useTheme(am4themes_animated);

        // Create chart instance
        const chart = am4core.create('am-simple-chart', am4charts.XYChart);
        chart.colors.list = [am4core.color('#089bab')];

        // Chart data
        chart.data = [
          { country: 'USA', visits: 2025 },
          { country: 'China', visits: 1882 },
          { country: 'Japan', visits: 1809 },
          { country: 'UK', visits: 1122 },
          { country: 'France', visits: 1114 },
        ];

        // X Axis
        const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = 'country';
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.minGridDistance = 30;
        categoryAxis.renderer.labels.template.adapter.add('dy', (value, target) => {
          if (target.dataItem && target.dataItem.index % 2 !== 0) { // Check if index is even
            return value + 25; // Move down
          }
          return value;
        });

        // Y Axis
        chart.yAxes.push(new am4charts.ValueAxis());

        // Series
        const columnSeries = chart.series.push(new am4charts.ColumnSeries());
        columnSeries.dataFields.valueY = 'visits';
        columnSeries.dataFields.categoryX = 'country';
        columnSeries.name = 'Visits';
        columnSeries.columns.template.tooltipText = '{categoryX}: [bold]{valueY}[/]';
        columnSeries.columns.template.fillOpacity = 0.8;

        // Columns template
        const columnTemplate = columnSeries.columns.template;
        columnTemplate.strokeWidth = 2;
        columnTemplate.strokeOpacity = 1;
      });

      // Cleanup on unmount
      return () => {
        am4core.disposeAllCharts();
      };
    }
  }, []);

  useEffect(() => {
    // Column and Line Mix Chart
    let chart = am4core.create("am-columnline-chart", am4charts.XYChart);
    chart.colors.list = [am4core.color("#089bab")];
    chart.exporting.menu = new am4core.ExportMenu();

    let categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "year";
    categoryAxis.renderer.minGridDistance = 30;

    chart.yAxes.push(new am4charts.ValueAxis());

    let columnSeries = chart.series.push(new am4charts.ColumnSeries());
    columnSeries.name = "Income";
    columnSeries.dataFields.valueY = "income";
    columnSeries.dataFields.categoryX = "year";
    columnSeries.columns.template.tooltipText =
      "[#fff font-size: 15px]{name} in {categoryX}:\n[/][#fff font-size: 20px]{valueY}[/] [#fff]{additional}[/]";
    columnSeries.columns.template.propertyFields.fillOpacity = "fillOpacity";
    columnSeries.columns.template.propertyFields.stroke = "stroke";
    columnSeries.columns.template.propertyFields.strokeWidth = "strokeWidth";
    columnSeries.columns.template.propertyFields.strokeDasharray = "columnDash";
    columnSeries.tooltip.label.textAlign = "middle";

    let lineSeries = chart.series.push(new am4charts.LineSeries());
    lineSeries.name = "Expenses";
    lineSeries.dataFields.valueY = "expenses";
    lineSeries.dataFields.categoryX = "year";
    lineSeries.stroke = am4core.color("#0dd6b8");
    lineSeries.strokeWidth = 3;
    lineSeries.propertyFields.strokeDasharray = "lineDash";
    lineSeries.tooltip.label.textAlign = "middle";

    let bullet = lineSeries.bullets.push(new am4charts.Bullet());
    bullet.fill = am4core.color("#fdd400");
    bullet.tooltipText =
      "[#fff font-size: 15px]{name} in {categoryX}:\n[/][#fff font-size: 20px]{valueY}[/] [#fff]{additional}[/]";

    let circle = bullet.createChild(am4core.Circle);
    circle.radius = 4;
    circle.fill = am4core.color("#fff");
    circle.strokeWidth = 3;

    chart.data = [
      { year: "2009", income: 23.5, expenses: 21.1 },
      { year: "2010", income: 26.2, expenses: 30.5 },
      { year: "2011", income: 30.1, expenses: 34.9 },
      { year: "2012", income: 29.5, expenses: 31.1 },
      { year: "2013", income: 30.6, expenses: 28.2, lineDash: "5,5" },
      {
        year: "2014",
        income: 34.1,
        expenses: 32.9,
        strokeWidth: 1,
        columnDash: "5,5",
        fillOpacity: 0.2,
        additional: "(projection)",
      },
    ];

    // Cleanup column and line chart on component unmount
    return () => {
      if (chart) {
        chart.dispose();
      }
    };
  }, []); // Runs only once, on mount

  // ------- Am LayerdColumn Chart -------
  useEffect(() => {
    am4core.ready(() => {
      am4core.useTheme(am4themes_animated);

      const chart = am4core.create('am-layeredcolumn-chart', am4charts.XYChart);
      chart.colors.list = [am4core.color('#fc9f5b'), am4core.color('#089bab')];
      chart.numberFormatter.numberFormat = '#.#"%';
      chart.data = [
        { country: 'USA', year2004: 3.5, year2005: 4.2 },
        { country: 'UK', year2004: 1.7, year2005: 3.1 },
        { country: 'Canada', year2004: 2.8, year2005: 2.9 },
        { country: 'Japan', year2004: 2.6, year2005: 2.3 },
        { country: 'France', year2004: 1.4, year2005: 2.1 },
        { country: 'Brazil', year2004: 2.6, year2005: 4.9 }
      ];

      const xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      xAxis.dataFields.category = 'country';
      xAxis.renderer.grid.template.location = 0;
      xAxis.renderer.minGridDistance = 30;

      const yAxis = chart.yAxes.push(new am4charts.ValueAxis());
      yAxis.title.text = 'GDP growth rate';
      yAxis.title.fontWeight = 800;

      const series1 = chart.series.push(new am4charts.ColumnSeries());
      series1.dataFields.valueY = 'year2004';
      series1.dataFields.categoryX = 'country';
      series1.clustered = false;
      series1.tooltipText = 'GDP grow in {categoryX} (2004): [bold]{valueY}[/]';

      const series2 = chart.series.push(new am4charts.ColumnSeries());
      series2.dataFields.valueY = 'year2005';
      series2.dataFields.categoryX = 'country';
      series2.clustered = false;
      series2.columns.template.width = am4core.percent(50);
      series2.tooltipText = 'GDP grow in {categoryX} (2005): [bold]{valueY}[/]';

      chart.cursor = new am4charts.XYCursor();
      chart.cursor.lineX.disabled = true;
      chart.cursor.lineY.disabled = true;

      return () => {
        chart.dispose(); // Clean up the chart when the component unmounts
      };
    });
  }, []);

  // ---------- Am Stacked Column Chart --------
  useEffect(() => {
    am4core.ready(() => {
      am4core.useTheme(am4themes_animated);

      const chart = am4core.create('am-stackedcolumn-chart', am4charts.XYChart);
      chart.colors.list = [
        am4core.color('#089bab'),
        am4core.color('#fc9f5b'),
        am4core.color('#e64141')
      ];
      chart.data = [
        { year: '2016', europe: 2.5, namerica: 2.5, asia: 2.1, lamerica: 0.3, meast: 0.2 },
        { year: '2017', europe: 2.6, namerica: 2.7, asia: 2.2, lamerica: 0.3, meast: 0.3 },
        { year: '2018', europe: 2.8, namerica: 2.9, asia: 2.4, lamerica: 0.3, meast: 0.3 }
      ];

      const xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      xAxis.dataFields.category = 'year';
      xAxis.renderer.grid.template.location = 0;

      const yAxis = chart.yAxes.push(new am4charts.ValueAxis());
      yAxis.renderer.inside = true;
      yAxis.renderer.labels.template.disabled = true;
      yAxis.min = 0;

      const createSeries = (field, name) => {
        const series = chart.series.push(new am4charts.ColumnSeries());
        series.name = name;
        series.dataFields.valueY = field;
        series.dataFields.categoryX = 'year';
        series.sequencedInterpolation = true;
        series.stacked = true;
        series.columns.template.width = am4core.percent(60);
        series.columns.template.tooltipText = '[bold]{name}[/]\n[font-size:14px]{categoryX}: {valueY}';

        const bullet = series.bullets.push(new am4charts.LabelBullet());
        bullet.label.text = '{valueY}';
        bullet.locationY = 0.5;

        return series;
      };

      createSeries('europe', 'Europe');
      createSeries('namerica', 'North America');
      createSeries('asia', 'Asia-Pacific');

      chart.legend = new am4charts.Legend();

      return () => {
        chart.dispose(); // Clean up the chart on unmount
      };
    });
  }, []);

  // ----- Am Barline Chart -----
  useEffect(() => {
    am4core.ready(() => {
      am4core.useTheme(am4themes_animated);

      const chart = am4core.create('am-barline-chart', am4charts.XYChart);
      chart.colors.list = [
        am4core.color('#089bab'),
        am4core.color('#fc9f5b')
      ];
      chart.data = [
        { year: '2005', income: 23.5, expenses: 18.1 },
        { year: '2006', income: 26.2, expenses: 22.8 },
        { year: '2007', income: 30.1, expenses: 23.9 },
        { year: '2008', income: 29.5, expenses: 25.1 },
        { year: '2009', income: 24.6, expenses: 25 }
      ];

      const yAxis = chart.yAxes.push(new am4charts.CategoryAxis());
      yAxis.dataFields.category = 'year';
      yAxis.renderer.inversed = true;
      yAxis.renderer.grid.template.location = 0;

      const xAxis = chart.xAxes.push(new am4charts.ValueAxis());
      xAxis.renderer.opposite = true;

      const incomeSeries = chart.series.push(new am4charts.ColumnSeries());
      incomeSeries.dataFields.categoryY = 'year';
      incomeSeries.dataFields.valueX = 'income';
      incomeSeries.name = 'Income';
      incomeSeries.columns.template.fillOpacity = 0.5;
      incomeSeries.columns.template.strokeOpacity = 0;
      incomeSeries.tooltipText = 'Income in {categoryY}: {valueX.value}';

      const expensesSeries = chart.series.push(new am4charts.LineSeries());
      expensesSeries.dataFields.categoryY = 'year';
      expensesSeries.dataFields.valueX = 'expenses';
      expensesSeries.name = 'Expenses';
      expensesSeries.strokeWidth = 3;
      expensesSeries.tooltipText = 'Expenses in {categoryY}: {valueX.value}';

      const bullet = expensesSeries.bullets.push(new am4charts.CircleBullet());
      bullet.circle.fill = am4core.color('#fff');
      bullet.circle.strokeWidth = 2;

      chart.cursor = new am4charts.XYCursor();
      chart.cursor.behavior = 'zoomY';
      chart.legend = new am4charts.Legend();

      return () => {
        chart.dispose(); // Clean up the chart on unmount
      };
    });
  }, []);

  // ----- Am Datedata Chart -----
  useEffect(() => {
    am4core.ready(() => {
      am4core.useTheme(am4themes_animated);

      const chart = am4core.create('am-datedata-chart', am4charts.XYChart);
      chart.colors.list = [am4core.color('#089bab')];
      chart.data = [
        { date: "2012-07-27", value: 13 },
        { date: "2012-07-28", value: 11 },
        { date: "2012-07-29", value: 15 },
        { date: "2012-07-30", value: 16 },
        { date: "2012-07-31", value: 18 },
        { date: "2012-08-01", value: 13 },
        { date: "2012-08-02", value: 22 },
        { date: "2012-08-03", value: 23 },
        { date: "2012-08-04", value: 20 },
        { date: "2012-08-05", value: 17 },
        { date: "2012-08-06", value: 16 },
        { date: "2012-08-07", value: 18 },
        { date: "2012-08-08", value: 21 },
        { date: "2012-08-09", value: 26 },
        { date: "2012-08-10", value: 24 },
        { date: "2012-08-11", value: 29 },
        { date: "2012-08-12", value: 32 },
        { date: "2012-08-13", value: 18 },
        { date: "2012-08-14", value: 24 },
        { date: "2012-08-15", value: 22 },
        { date: "2012-08-16", value: 18 },
        { date: "2012-08-17", value: 19 },
        { date: "2012-08-18", value: 14 },
        { date: "2012-08-19", value: 15 },
        { date: "2012-08-20", value: 12 },
        { date: "2012-08-21", value: 8 },
        { date: "2012-08-22", value: 9 },
        { date: "2012-08-23", value: 8 },
        { date: "2012-08-24", value: 7 },
        { date: "2012-08-25", value: 5 },
        { date: "2012-08-26", value: 11 },
        { date: "2012-08-27", value: 13 },
        { date: "2012-08-28", value: 18 },
        { date: "2012-08-29", value: 20 },
        { date: "2012-08-30", value: 29 },
        { date: "2012-08-31", value: 33 },
        { date: "2012-09-01", value: 42 },
        { date: "2012-09-02", value: 35 },
        { date: "2012-09-03", value: 31 },
        { date: "2012-09-04", value: 47 },
        { date: "2012-09-05", value: 52 },
        { date: "2012-09-06", value: 46 },
        { date: "2012-09-07", value: 41 },
        { date: "2012-09-08", value: 43 },
        { date: "2012-09-09", value: 40 },
        { date: "2012-09-10", value: 39 },
        { date: "2012-09-11", value: 34 },
        { date: "2012-09-12", value: 29 },
        { date: "2012-09-13", value: 34 },
        { date: "2012-09-14", value: 37 },
        { date: "2012-09-15", value: 42 },
        { date: "2012-09-16", value: 49 },
        { date: "2012-09-17", value: 46 },
        { date: "2012-09-18", value: 47 },
        { date: "2012-09-19", value: 55 },
        { date: "2012-09-20", value: 59 },
        { date: "2012-09-21", value: 58 },
        { date: "2012-09-22", value: 57 },
        { date: "2012-09-23", value: 61 },
        { date: "2012-09-24", value: 59 },
        { date: "2012-09-25", value: 67 },
        { date: "2012-09-26", value: 65 },
        { date: "2012-09-27", value: 61 },
        { date: "2012-09-28", value: 66 },
        { date: "2012-09-29", value: 69 },
        { date: "2012-09-30", value: 71 },
        { date: "2012-10-01", value: 67 },
        { date: "2012-10-02", value: 63 },
        { date: "2012-10-03", value: 46 },
        { date: "2012-10-04", value: 32 },
        { date: "2012-10-05", value: 21 },
        { date: "2012-10-06", value: 18 },
        { date: "2012-10-07", value: 21 },
        { date: "2012-10-08", value: 28 },
        { date: "2012-10-09", value: 27 },
        { date: "2012-10-10", value: 36 },
        { date: "2012-10-11", value: 33 },
        { date: "2012-10-12", value: 31 },
        { date: "2012-10-13", value: 30 },
        { date: "2012-10-14", value: 34 },
        { date: "2012-10-15", value: 38 },
        { date: "2012-10-16", value: 37 },
        { date: "2012-10-17", value: 44 },
        { date: "2012-10-18", value: 49 },
        { date: "2012-10-19", value: 53 },
        { date: "2012-10-20", value: 57 },
        { date: "2012-10-21", value: 60 },
        { date: "2012-10-22", value: 61 },
        { date: "2012-10-23", value: 69 },
        { date: "2012-10-24", value: 67 },
        { date: "2012-10-25", value: 72 },
        { date: "2012-10-26", value: 77 },
        { date: "2012-10-27", value: 75 },
        { date: "2012-10-28", value: 70 },
        { date: "2012-10-29", value: 72 },
        { date: "2012-10-30", value: 70 },
        { date: "2012-10-31", value: 72 },
        { date: "2012-11-01", value: 73 },
        { date: "2012-11-02", value: 67 },
        { date: "2012-11-03", value: 68 },
        { date: "2012-11-04", value: 65 },
        { date: "2012-11-05", value: 71 },
        { date: "2012-11-06", value: 75 },
        { date: "2012-11-07", value: 74 },
        { date: "2012-11-08", value: 71 },
        { date: "2012-11-09", value: 76 },
        { date: "2012-11-10", value: 77 },
        { date: "2012-11-11", value: 81 },
        { date: "2012-11-12", value: 83 },
        { date: "2012-11-13", value: 80 },
        { date: "2012-11-14", value: 81 },
        { date: "2012-11-15", value: 87 },
        { date: "2012-11-16", value: 82 },
        { date: "2012-11-17", value: 86 },
        { date: "2012-11-18", value: 80 },
        { date: "2012-11-19", value: 87 },
        { date: "2012-11-20", value: 83 },
        { date: "2012-11-21", value: 85 },
        { date: "2012-11-22", value: 84 },
        { date: "2012-11-23", value: 82 },
        { date: "2012-11-24", value: 73 },
        { date: "2012-11-25", value: 71 },
        { date: "2012-11-26", value: 75 },
        { date: "2012-11-27", value: 79 },
        { date: "2012-11-28", value: 70 },
        { date: "2012-11-29", value: 73 },
        { date: "2012-11-30", value: 61 },
        { date: "2012-12-01", value: 62 },
        { date: "2012-12-02", value: 66 },
        { date: "2012-12-03", value: 65 },
        { date: "2012-12-04", value: 73 },
        { date: "2012-12-05", value: 79 },
        { date: "2012-12-06", value: 78 },
        { date: "2012-12-07", value: 78 },
        { date: "2012-12-08", value: 78 },
        { date: "2012-12-09", value: 74 },
        { date: "2012-12-10", value: 73 },
        { date: "2012-12-11", value: 75 },
        { date: "2012-12-12", value: 70 },
        { date: "2012-12-13", value: 77 },
        { date: "2012-12-14", value: 67 },
        { date: "2012-12-15", value: 62 },
        { date: "2012-12-16", value: 64 },
        { date: "2012-12-17", value: 61 },
        { date: "2012-12-18", value: 59 },
        { date: "2012-12-19", value: 53 },
        { date: "2012-12-20", value: 54 },
        { date: "2012-12-21", value: 56 },
        { date: "2012-12-22", value: 59 },
        { date: "2012-12-23", value: 58 },
        { date: "2012-12-24", value: 55 },
        { date: "2012-12-25", value: 52 },
        { date: "2012-12-26", value: 54 },
        { date: "2012-12-27", value: 50 },
        { date: "2012-12-28", value: 50 },
        { date: "2012-12-29", value: 51 },
        { date: "2012-12-30", value: 52 },
        { date: "2012-12-31", value: 58 },
        { date: "2013-01-01", value: 60 },
        { date: "2013-01-02", value: 67 },
        { date: "2013-01-03", value: 64 },
        { date: "2013-01-04", value: 66 },
        { date: "2013-01-05", value: 60 },
        { date: "2013-01-06", value: 63 },
        { date: "2013-01-07", value: 61 },
        { date: "2013-01-08", value: 60 },
        { date: "2013-01-09", value: 65 },
        { date: "2013-01-10", value: 75 },
        { date: "2013-01-11", value: 77 },
        { date: "2013-01-12", value: 78 },
        { date: "2013-01-13", value: 70 },
        { date: "2013-01-14", value: 70 },
        { date: "2013-01-15", value: 73 },
        { date: "2013-01-16", value: 71 },
        { date: "2013-01-17", value: 74 },
        { date: "2013-01-18", value: 78 },
        { date: "2013-01-19", value: 85 },
        { date: "2013-01-20", value: 82 },
        { date: "2013-01-21", value: 83 },
        { date: "2013-01-22", value: 88 },
        { date: "2013-01-23", value: 85 },
        { date: "2013-01-24", value: 85 },
        { date: "2013-01-25", value: 80 },
        { date: "2013-01-26", value: 87 },
        { date: "2013-01-27", value: 84 },
        { date: "2013-01-28", value: 83 },
        { date: "2013-01-29", value: 84 },
        { date: "2013-01-30", value: 81 }
      ];
      chart.dateFormatter.inputDateFormat = 'yyyy-MM-dd';

      const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.max = 100; // Set the maximum value of the Y-axis to 100
      const series = chart.series.push(new am4charts.LineSeries());

      series.dataFields.valueY = 'value';
      series.dataFields.dateX = 'date';
      series.tooltipText = '{value}';
      series.strokeWidth = 2;
      series.minBulletDistance = 15;
      series.tooltip.background.cornerRadius = 20;
      series.tooltip.background.strokeOpacity = 0;
      series.tooltip.pointerOrientation = 'vertical';
      series.tooltip.label.minWidth = 40;
      series.tooltip.label.minHeight = 40;
      series.tooltip.label.textAlign = 'middle';
      series.tooltip.label.textValign = 'middle';

      const bullet = series.bullets.push(new am4charts.CircleBullet());
      bullet.circle.strokeWidth = 2;
      bullet.circle.radius = 4;
      bullet.circle.fill = am4core.color('#fff');
      bullet.states.create('hover').properties.scale = 1.3;

      chart.cursor = new am4charts.XYCursor();
      chart.cursor.behavior = 'panXY';
      chart.cursor.xAxis = dateAxis;
      chart.cursor.snapToSeries = series;

      chart.scrollbarY = new am4core.Scrollbar();
      chart.scrollbarY.parent = chart.leftAxesContainer;
      chart.scrollbarY.toBack();
      chart.scrollbarX = new am4charts.XYChartScrollbar();
      chart.scrollbarX.series.push(series);
      chart.scrollbarX.parent = chart.bottomAxesContainer;
      dateAxis.start = 0.79;
      dateAxis.keepSelection = true;

      return () => {
        chart.dispose(); // Cleanup chart on unmount
      };
    });
  }, []);

  // ----- Am Linescrollzoom Chart -----

  useEffect(() => {
    const chartContainer = document.getElementById('am-linescrollzomm-chart');

    if (chartContainer) {
      am4core.ready(() => {
        am4core.useTheme(am4themes_animated);

        // Create chart instance
        const chart = am4core.create('am-linescrollzomm-chart', am4charts.XYChart);
        chart.colors.list = [am4core.color('#089bab')];

        // Generate data
        const chartData = (() => {
          const data = [];
          const date = new Date();
          date.setDate(date.getDate() - 1000);
          let visits = 1200;

          for (let n = 0; n < 500; n++) {
            const newDate = new Date(date);
            newDate.setDate(newDate.getDate() + n);
            // Ensure visits are always below 1250
            visits += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
            visits = Math.max(950, Math.min(visits, 1250)); // Clamp visits between 950 and 1250
            data.push({ date: newDate, visits });
          }

          return data;
        })();

        chart.data = chartData;

        // X Axis
        const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.minGridDistance = 50;

        // Y Axis
        const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxis.max = 1250;
        valueAxis.min = 950;
        valueAxis.renderer.minGridDistance = 50;


        // Series
        const lineSeries = chart.series.push(new am4charts.LineSeries());
        lineSeries.dataFields.valueY = 'visits';
        lineSeries.dataFields.dateX = 'date';
        lineSeries.strokeWidth = 2;
        lineSeries.minBulletDistance = 10;
        lineSeries.tooltipText = '{valueY}';
        lineSeries.tooltip.pointerOrientation = 'vertical';
        lineSeries.tooltip.background.cornerRadius = 20;
        lineSeries.tooltip.background.fillOpacity = 0.5;
        lineSeries.tooltip.label.padding(12, 12, 12, 12);

        // Scrollbar
        chart.scrollbarX = new am4charts.XYChartScrollbar();
        chart.scrollbarX.series.push(lineSeries);

        // Cursor
        chart.cursor = new am4charts.XYCursor();
        chart.cursor.xAxis = dateAxis;
        chart.cursor.snapToSeries = lineSeries;
      });

      // Cleanup on unmount
      return () => {
        am4core.disposeAllCharts();
      };
    }
  }, []);


  // ----- Am Zoomable Chart -----
  useEffect(() => {
    am4core.ready(() => {
      am4core.useTheme(am4themes_animated);

      const chart = am4core.create('am-zoomable-chart', am4charts.XYChart);
      chart.colors.list = [am4core.color('#089bab')];

      // Data
      chart.data = [
        { date: '2012-07-27', value: 13 },
        { date: '2012-07-28', value: 11 },
        { date: '2012-07-29', value: 15 },
        { date: '2012-07-30', value: 16 },
        { date: '2012-07-31', value: 18 },
        { date: '2012-08-01', value: 13 },
        { date: '2012-08-02', value: 22 },
        { date: '2012-08-03', value: 23 },
        { date: '2012-08-04', value: 20 },
        { date: '2012-08-05', value: 17 },
        { date: '2012-08-06', value: 16 },
        { date: '2012-08-07', value: 18 },
        { date: '2012-08-08', value: 21 },
        { date: '2012-08-09', value: 26 },
        { date: '2012-08-10', value: 24 },
        { date: '2012-08-11', value: 29 },
        { date: '2012-08-12', value: 32 },
        { date: '2012-08-13', value: 18 },
        { date: '2012-08-14', value: 24 },
        { date: '2012-08-15', value: 22 },
        { date: '2012-08-16', value: 18 },
        { date: '2012-08-17', value: 19 },
        { date: '2012-08-18', value: 14 },
        { date: '2012-08-19', value: 15 },
        { date: '2012-08-20', value: 12 },
        { date: '2012-08-21', value: 8 },
        { date: '2012-08-22', value: 9 },
        { date: '2012-08-23', value: 8 },
        { date: '2012-08-24', value: 7 },
        { date: '2012-08-25', value: 5 },
        { date: '2012-08-26', value: 11 },
        { date: '2012-08-27', value: 13 },
        { date: '2012-08-28', value: 18 },
        { date: '2012-08-29', value: 20 },
        { date: '2012-08-30', value: 29 },
        { date: '2012-08-31', value: 33 },
        { date: '2012-09-01', value: 42 },
        { date: '2012-09-02', value: 35 },
        { date: '2012-09-03', value: 31 },
        { date: '2012-09-04', value: 47 },
        { date: '2012-09-05', value: 52 },
        { date: '2012-09-06', value: 46 },
        { date: '2012-09-07', value: 41 },
        { date: '2012-09-08', value: 43 },
        { date: '2012-09-09', value: 40 },
        { date: '2012-09-10', value: 39 },
        { date: '2012-09-11', value: 34 },
        { date: '2012-09-12', value: 29 },
        { date: '2012-09-13', value: 34 },
        { date: '2012-09-14', value: 37 },
        { date: '2012-09-15', value: 42 },
        { date: '2012-09-16', value: 49 },
        { date: '2012-09-17', value: 46 },
        { date: '2012-09-18', value: 47 },
        { date: '2012-09-19', value: 55 },
        { date: '2012-09-20', value: 59 },
        { date: '2012-09-21', value: 58 },
        { date: '2012-09-22', value: 57 },
        { date: '2012-09-23', value: 61 },
        { date: '2012-09-24', value: 59 },
        { date: '2012-09-25', value: 67 },
        { date: '2012-09-26', value: 65 },
        { date: '2012-09-27', value: 61 },
        { date: '2012-09-28', value: 66 },
        { date: '2012-09-29', value: 69 },
        { date: '2012-09-30', value: 71 },
        { date: '2012-10-01', value: 67 },
        { date: '2012-10-02', value: 63 },
        { date: '2012-10-03', value: 46 },
        { date: '2012-10-04', value: 32 },
        { date: '2012-10-05', value: 21 },
        { date: '2012-10-06', value: 18 },
        { date: '2012-10-07', value: 21 },
        { date: '2012-10-08', value: 28 },
        { date: '2012-10-09', value: 27 },
        { date: '2012-10-10', value: 36 },
        { date: '2012-10-11', value: 33 },
        { date: '2012-10-12', value: 31 },
        { date: '2012-10-13', value: 30 },
        { date: '2012-10-14', value: 34 },
        { date: '2012-10-15', value: 38 },
        { date: '2012-10-16', value: 37 },
        { date: '2012-10-17', value: 44 },
        { date: '2012-10-18', value: 49 },
        { date: '2012-10-19', value: 53 },
        { date: '2012-10-20', value: 57 },
        { date: '2012-10-21', value: 60 },
        { date: '2012-10-22', value: 61 },
        { date: '2012-10-23', value: 69 },
        { date: '2012-10-24', value: 67 },
        { date: '2012-10-25', value: 72 },
        { date: '2012-10-26', value: 77 },
        { date: '2012-10-27', value: 75 },
        { date: '2012-10-28', value: 70 },
        { date: '2012-10-29', value: 72 },
        { date: '2012-10-30', value: 70 },
        { date: '2012-10-31', value: 72 },
        { date: '2012-11-01', value: 73 },
        { date: '2012-11-02', value: 67 },
        { date: '2012-11-03', value: 68 },
        { date: '2012-11-04', value: 65 },
        { date: '2012-11-05', value: 71 },
        { date: '2012-11-06', value: 75 },
        { date: '2012-11-07', value: 74 },
        { date: '2012-11-08', value: 71 },
        { date: '2012-11-09', value: 76 },
        { date: '2012-11-10', value: 77 },
        { date: '2012-11-11', value: 81 },
        { date: '2012-11-12', value: 83 },
        { date: '2012-11-13', value: 80 },
        { date: '2012-11-18', value: 80 },
        { date: '2012-11-19', value: 87 },
        { date: '2012-11-20', value: 83 },
        { date: '2012-11-21', value: 85 },
        { date: '2012-11-22', value: 84 },
        { date: '2012-11-23', value: 82 },
        { date: '2012-11-24', value: 73 },
        { date: '2012-11-25', value: 71 },
        { date: '2012-11-26', value: 75 },
        { date: '2012-11-27', value: 79 },
        { date: '2012-11-28', value: 70 },
        { date: '2012-11-29', value: 73 },
        { date: '2012-11-30', value: 61 },
        { date: '2012-12-01', value: 62 },
        { date: '2012-12-02', value: 66 },
        { date: '2012-12-03', value: 65 },
        { date: '2012-12-04', value: 73 },
        { date: '2012-12-05', value: 79 },
        { date: '2012-12-06', value: 78 },
        { date: '2012-12-07', value: 78 },
        { date: '2012-12-08', value: 78 },
        { date: '2012-12-09', value: 74 },
        { date: '2012-12-10', value: 73 },
        { date: '2012-12-11', value: 75 },
        { date: '2012-12-12', value: 70 },
        { date: '2012-12-13', value: 77 },
        { date: '2012-12-14', value: 67 },
        { date: '2012-12-15', value: 62 },
        { date: '2012-12-16', value: 64 },
        { date: '2012-12-17', value: 61 },
        { date: '2012-12-18', value: 59 },
        { date: '2012-12-19', value: 53 },
        { date: '2012-12-20', value: 54 },
        { date: '2012-12-21', value: 56 },
        { date: '2012-12-22', value: 59 },
        { date: '2012-12-23', value: 58 },
        { date: '2012-12-24', value: 55 },
        { date: '2012-12-25', value: 52 },
        { date: '2012-12-26', value: 54 },
        { date: '2012-12-27', value: 50 },
        { date: '2012-12-28', value: 50 },
        { date: '2012-12-29', value: 51 },
        { date: '2012-12-30', value: 52 },
        { date: '2012-12-31', value: 58 },
        { date: '2013-01-01', value: 60 },
        { date: '2013-01-02', value: 67 },
        { date: '2013-01-03', value: 64 },
        { date: '2013-01-04', value: 66 },
        { date: '2013-01-05', value: 60 },
        { date: '2013-01-06', value: 63 },
        { date: '2013-01-07', value: 61 },
        { date: '2013-01-08', value: 60 },
        { date: '2013-01-09', value: 65 },
        { date: '2013-01-10', value: 75 },
        { date: '2013-01-11', value: 77 },
        { date: '2013-01-12', value: 78 },
        { date: '2013-01-13', value: 70 },
        { date: '2013-01-14', value: 70 },
        { date: '2013-01-15', value: 73 },
        { date: '2013-01-16', value: 71 },
        { date: '2013-01-17', value: 74 },
        { date: '2013-01-18', value: 78 },
        { date: '2013-01-19', value: 85 },
        { date: '2013-01-20', value: 82 },
        { date: '2013-01-21', value: 83 },
        { date: '2013-01-22', value: 88 },
        { date: '2013-01-23', value: 85 },
        { date: '2013-01-24', value: 85 },
        { date: '2013-01-25', value: 80 },
        { date: '2013-01-26', value: 87 },
        { date: '2013-01-27', value: 84 },
        { date: '2013-01-28', value: 83 },
        { date: '2013-01-29', value: 84 },
        { date: '2013-01-30', value: 81 },
      ];

      // Create axes
      const dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.grid.template.location = 0;
      dateAxis.renderer.minGridDistance = 50;

      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

      // Create series
      const series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.valueY = 'value';
      series.dataFields.dateX = 'date';
      series.strokeWidth = 3;
      series.fillOpacity = 0.5;

      // Add scrollbars and cursor
      chart.scrollbarY = new am4core.Scrollbar();
      chart.scrollbarY.marginLeft = 0;
      chart.cursor = new am4charts.XYCursor();
      chart.cursor.behavior = 'zoomY';
      chart.cursor.lineX.disabled = true;

      // Clean up chart on component unmount
      return () => {
        chart.dispose();
      };
    });
  }, []);

  // -----  Am Radar Chart -----
  useEffect(() => {
    am4core.ready(() => {
      am4core.useTheme(am4themes_animated);

      // Create chart instance
      const chart = am4core.create('am-radar-chart', am4charts.RadarChart);
      chart.colors.list = [am4core.color('#089bab')];

      // Chart data
      chart.data = [
        { country: 'Lithuania', litres: 501 },
        { country: 'Czechia', litres: 301 },
        { country: 'Ireland', litres: 266 },
        { country: 'Germany', litres: 165 },
        { country: 'Australia', litres: 139 },
        { country: 'Austria', litres: 336 },
        { country: 'UK', litres: 290 },
        { country: 'Belgium', litres: 325 },
        { country: 'The Netherlands', litres: 40 }
      ];

      // Create axes
      const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      categoryAxis.dataFields.category = 'country';

      const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.renderer.axisFills.template.fill = chart.colors.getIndex(2);
      valueAxis.renderer.axisFills.template.fillOpacity = 0.05;

      // Create series
      const radarSeries = chart.series.push(new am4charts.RadarSeries());
      radarSeries.dataFields.valueY = 'litres';
      radarSeries.dataFields.categoryX = 'country';
      radarSeries.name = 'Sales';
      radarSeries.strokeWidth = 3;

      // Clean up chart on component unmount
      return () => {
        chart.dispose();
      };
    });
  }, []);


  // ----- Am Polarscatter Chart -----
  useEffect(() => {
    am4core.ready(() => {
      am4core.useTheme(am4themes_animated);

      // Create chart instance
      const chart = am4core.create('am-polarscatter-chart', am4charts.RadarChart);
      chart.colors.list = [
        am4core.color('#089bab'),
        am4core.color('#fc9f5b'),
        am4core.color('#e64141'),
      ];

      // Chart data
      chart.data = [
        { country: 'Lithuania', litres: 501, units: 250 },
        { country: 'Czech Republic', litres: 301, units: 222 },
        { country: 'Ireland', litres: 266, units: 179 },
        { country: 'Germany', litres: 165, units: 298 },
        { country: 'Australia', litres: 139, units: 299 },
      ];

      // X Axis
      const xAxis = chart.xAxes.push(new am4charts.ValueAxis());
      xAxis.renderer.maxLabelPosition = 0.99;

      // Y Axis
      const yAxis = chart.yAxes.push(new am4charts.ValueAxis());
      yAxis.renderer.labels.template.verticalCenter = 'bottom';
      yAxis.renderer.labels.template.horizontalCenter = 'right';
      yAxis.renderer.maxLabelPosition = 0.99;
      yAxis.renderer.labels.template.paddingBottom = 1;
      yAxis.renderer.labels.template.paddingRight = 3;

      // Series 1
      const series1 = chart.series.push(new am4charts.RadarSeries());
      series1.bullets.push(new am4charts.CircleBullet());
      series1.strokeOpacity = 0;
      series1.dataFields.valueX = 'x';
      series1.dataFields.valueY = 'y';
      series1.name = 'Series #1';
      series1.sequencedInterpolation = true;
      series1.sequencedInterpolationDelay = 10;
      series1.data = [
        { x: 83, y: 5.1 },
        { x: 44, y: 5.8 },
        { x: 76, y: 9 },
        { x: 2, y: 1.4 },
        { x: 100, y: 8.3 },
        { x: 96, y: 1.7 },
        { x: 68, y: 3.9 },
        { x: 0, y: 3 },
        { x: 100, y: 4.1 },
        { x: 16, y: 5.5 },
        { x: 71, y: 6.8 },
        { x: 100, y: 7.9 },
        { x: 35, y: 8 },
        { x: 44, y: 6 },
        { x: 64, y: 0.7 },
        { x: 53, y: 3.3 },
        { x: 92, y: 4.1 },
        { x: 43, y: 7.3 },
        { x: 15, y: 7.5 },
        { x: 43, y: 4.3 },
        { x: 90, y: 9.9 },
      ];

      // Series 2
      const series2 = chart.series.push(new am4charts.RadarSeries());
      series2.bullets.push(new am4charts.CircleBullet());
      series2.strokeOpacity = 0;
      series2.dataFields.valueX = 'x';
      series2.dataFields.valueY = 'y';
      series2.name = 'Series #2';
      series2.sequencedInterpolation = true;
      series2.sequencedInterpolationDelay = 10;
      series2.data = [
        { x: 178, y: 1.3 },
        { x: 129, y: 3.4 },
        { x: 99, y: 2.4 },
        { x: 80, y: 9.9 },
        { x: 118, y: 9.4 },
        { x: 103, y: 8.7 },
        { x: 91, y: 4.2 },
        { x: 151, y: 1.2 },
        { x: 168, y: 5.2 },
        { x: 168, y: 1.6 },
        { x: 152, y: 1.2 },
        { x: 138, y: 7.7 },
        { x: 107, y: 3.9 },
        { x: 124, y: 0.7 },
        { x: 130, y: 2.6 },
        { x: 86, y: 9.2 },
        { x: 169, y: 7.5 },
        { x: 122, y: 9.9 },
        { x: 100, y: 3.8 },
        { x: 172, y: 4.1 },
        { x: 140, y: 7.3 },
        { x: 161, y: 2.3 },
        { x: 141, y: 0.9 },
      ];

      // Series 3
      const series3 = chart.series.push(new am4charts.RadarSeries());
      series3.bullets.push(new am4charts.CircleBullet());
      series3.strokeOpacity = 0;
      series3.dataFields.valueX = 'x';
      series3.dataFields.valueY = 'y';
      series3.name = 'Series #3';
      series3.sequencedInterpolation = true;
      series3.sequencedInterpolationDelay = 10;
      series3.data = [
        { x: 419, y: 4.9 },
        { x: 417, y: 5.5 },
        { x: 434, y: 0.1 },
        { x: 344, y: 2.5 },
        { x: 279, y: 7.5 },
        { x: 307, y: 8.4 },
        { x: 279, y: 9 },
        { x: 220, y: 8.4 },
        { x: 201, y: 9.7 },
        { x: 288, y: 1.2 },
        { x: 333, y: 7.4 },
        { x: 308, y: 1.9 },
        { x: 330, y: 8 },
        { x: 408, y: 1.7 },
        { x: 274, y: 0.8 },
        { x: 296, y: 3.1 },
        { x: 279, y: 4.3 },
        { x: 379, y: 5.6 },
        { x: 175, y: 6.8 },
      ];

      // Legend and Cursor
      chart.legend = new am4charts.Legend();
      chart.cursor = new am4charts.RadarCursor();

      // Clean up chart on component unmount
      return () => {
        chart.dispose();
      };
    });
  }, []);

  // ----- Am Polar Chart -----
  useEffect(() => {
    am4core.ready(() => {
      am4core.useTheme(am4themes_animated);

      // Create chart instance
      const chart = am4core.create('am-polar-chart', am4charts.RadarChart);

      // Chart data
      chart.data = [
        { direction: 'N', value: 8 },
        { direction: 'NE', value: 9 },
        { direction: 'E', value: 4.5 },
        { direction: 'SE', value: 3.5 },
        { direction: 'S', value: 9.2 },
        { direction: 'SW', value: 8.4 },
        { direction: 'W', value: 11.1 },
        { direction: 'NW', value: 10 },
      ];

      // X Axis
      const xAxis = chart.xAxes.push(new am4charts.CategoryAxis());
      xAxis.dataFields.category = 'direction';

      // Y Axis
      chart.yAxes.push(new am4charts.ValueAxis());

      // Axis Ranges
      const nwRange = xAxis.axisRanges.create();
      nwRange.category = 'NW';
      nwRange.endCategory = 'NW';
      nwRange.axisFill.fill = am4core.color('#0dd6b8');
      nwRange.axisFill.fillOpacity = 0.3;

      const nRange = xAxis.axisRanges.create();
      nRange.category = 'N';
      nRange.endCategory = 'N';
      nRange.axisFill.fill = am4core.color('#0dd6b8');
      nRange.axisFill.fillOpacity = 0.3;

      const seSwRange = xAxis.axisRanges.create();
      seSwRange.category = 'SE';
      seSwRange.endCategory = 'SW';
      seSwRange.axisFill.fill = am4core.color('#fbc647');
      seSwRange.axisFill.fillOpacity = 0.3;
      seSwRange.locations.endCategory = 0;

      // Series
      const series = chart.series.push(new am4charts.RadarSeries());
      series.dataFields.valueY = 'value';
      series.dataFields.categoryX = 'direction';
      series.name = 'Wind direction';
      series.strokeWidth = 3;
      series.fillOpacity = 0.2;

      // Clean up chart on component unmount
      return () => {
        chart.dispose();
      };
    });
  }, []);

  // ------- Am 3dpie Chart -------
  useEffect(() => {
    const chartContainer = document.getElementById('am-3dpie-chart');

    if (chartContainer) {
      const setChartSize = () => {
        if (window.matchMedia('(max-width: 600px)').matches) {
          chartContainer.style.height = '400px';
        } else {
          chartContainer.style.height = '450px';
        }
      };

      setChartSize();
      window.addEventListener('resize', setChartSize);

      am4core.ready(() => {
        am4core.useTheme(am4themes_animated);

        // Create chart instance
        const chart = am4core.create('am-3dpie-chart', am4charts.PieChart3D);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in effect

        // Add legend
        chart.legend = new am4charts.Legend();

        // Chart data
        chart.data = [
          { country: 'Lithuania', litres: 501.9 },
          { country: 'Germany', litres: 165.8 },
          { country: 'Australia', litres: 139.9 },
          { country: 'Austria', litres: 128.3 },
          { country: 'UK', litres: 99 },
          { country: 'Belgium', litres: 60 },
        ];

        // Series
        const series = chart.series.push(new am4charts.PieSeries3D());
        series.colors.list = [
          am4core.color('#089bab'),
          am4core.color('#fc9f5b'),
          am4core.color('#57de73'),
          am4core.color('#f26361'),
          am4core.color('#ababab'),
          am4core.color('#61e2fc'),
        ];
        series.dataFields.value = 'litres';
        series.dataFields.category = 'country';
      });

      // Cleanup on unmount
      return () => {
        chartContainer.style.height = ''; // Reset height on unmount
        am4core.disposeAllCharts();
      };
    }
  }, []);


  return (
    <>

      <Row>
        <Col xs={12} lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between rounded-top-5 ">
              <div className="header-title">
                <h4 className="card-title">Simple Column Chart</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <div id="am-simple-chart" className="custom-chart"></div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between rounded-top-5 ">
              <div className="header-title">
                <h4 className="card-title">Column and Line Mix Chart</h4>
              </div>
            </Card.Header>
            <Card.Body>
              <div
                id="am-columnline-chart"
                className="custom-chart"
                style={{ width: "100%", height: "400px" }}
              ></div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between rounded-top-5">
              <Card.Header.Title className="header-title">
                <h4 className="card-title">Layered Column Chart</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <div id="am-layeredcolumn-chart" className="custom-chart" style={{ width: "100%", height: "400px" }}></div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between rounded-top-5">
              <Card.Header.Title>
                <h4 className="card-title">Stacked Column Chart</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <div id="am-stackedcolumn-chart" className="custom-chart" style={{ width: "100%", height: "400px" }}></div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between rounded-top-5">
              <Card.Header.Title>
                <h4 className="card-title">Bar and Line Chart Mix</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body >
              <div id="am-barline-chart" className="custom-chart" style={{ width: "100%", height: "400px" }}></div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between rounded-top-5">
              <Card.Header.Title>
                <h4 className="card-title">Date Based Data</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <div id="am-datedata-chart" className="custom-chart" style={{ width: "100%", height: "400px" }}></div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between rounded-top-5">
              <Card.Header.Title>
                <h4 className="card-title">Line Chart with Scroll and
                  Zoom</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <div id="am-linescrollzomm-chart" className="custom-chart" style={{ width: "100%", height: "400px" }}></div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between rounded-top-5">
              <Card.Header.Title>
                <h4 className="card-title">Zoomable on Value Axis</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <div id="am-zoomable-chart" className="custom-chart" style={{ width: "100%", height: "400px" }}></div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between rounded-top-5 ">
              <Card.Header.Title>
                <h4 className="card-title">Radar Chart</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <div id="am-radar-chart" className="custom-chart" style={{ width: "100%", height: "400px" }}></div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between rounded-top-5">
              <Card.Header.Title>
                <h4 className="card-title">Polar Scatter</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <div id="am-polarscatter-chart" className="custom-chart" style={{ width: "100%", height: "400px" }}></div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between rounded-top-5">
              <Card.Header.Title>
                <h4 className="card-title">Polar Chart</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <div id="am-polar-chart" className="custom-chart" style={{ width: "100%", height: "400px" }}></div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} lg={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between rounded-top-5">
              <Card.Header.Title>
                <h4 className="card-title">3D Pie Chart</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <div id="am-3dpie-chart"  style={{ width: "100%", height: "400px" }}></div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </>
  );
};

export default ChartAm;
