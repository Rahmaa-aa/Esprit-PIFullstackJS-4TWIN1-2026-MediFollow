import React, { useEffect } from "react";
import {
  Button,
  CardTitle,
  Col,
  Container,
  Dropdown,
  Nav,
  ProgressBar,
  Row,
  Tab,
  Table,
} from "react-bootstrap";
import Chart from "react-apexcharts";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import ReactApexChart from "react-apexcharts";
import Card from "../../components/Card";

const generatePath = (path) => {
  return window.origin + import.meta.env.BASE_URL + path;
};

const HospitalDashboardTwo = () => {
  // Activity Statistics Chart
  const chartOptions = {
    series: [
      {
        name: "PRODUCT A",
        data: [44, 55, 41, 67, 22, 43],
      },
      {
        name: "PRODUCT B",
        data: [13, 23, 20, 8, 13, 27],
      },
      {
        name: "PRODUCT C",
        data: [11, 17, 15, 15, 21, 14],
      },
    ],
    colors: ["#089bab", "#FC9F5B", "#5bc5d1"],
    chart: {
      type: "bar",
      height: 350,
      stacked: true,
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: true,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          legend: {
            position: "bottom",
            offsetX: -10,
            offsetY: 0,
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
      },
    },
    xaxis: {
      type: "datetime",
      categories: [
        "01/01/2011 GMT",
        "01/02/2011 GMT",
        "01/03/2011 GMT",
        "01/04/2011 GMT",
        "01/05/2011 GMT",
        "01/06/2011 GMT",
      ],
    },
    legend: {
      position: "right",
      offsetY: 40,
    },
    fill: {
      opacity: 1,
    },
  };

  // Patient Distribution Chart
  useEffect(() => {
    // Use the animated theme
    am4core.useTheme(am4themes_animated);

    // Create chart instance
    const chart = am4core.create("doc-chart-01", am4charts.RadarChart);

    // Chart data
    chart.data = [
      {
        country: "USA",
        visits: 2025,
      },
      {
        country: "China",
        visits: 1882,
      },
      {
        country: "Japan",
        visits: 1809,
      },
      {
        country: "Germany",
        visits: 1322,
      },
      {
        country: "UK",
        visits: 1122,
      },
      {
        country: "France",
        visits: 1114,
      },
      {
        country: "India",
        visits: 984,
      },
      {
        country: "Spain",
        visits: 711,
      },
      {
        country: "Netherlands",
        visits: 665,
      },
      {
        country: "Russia",
        visits: 580,
      },
      {
        country: "South Korea",
        visits: 443,
      },
      {
        country: "Canada",
        visits: 441,
      },
    ];

    // Configure chart
    chart.innerRadius = am4core.percent(40);

    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "country";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.labels.template.location = 0.5;
    categoryAxis.renderer.grid.template.strokeOpacity = 0.08;

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.extraMax = 0.1;
    valueAxis.renderer.grid.template.strokeOpacity = 0.08;

    const series = chart.series.push(new am4charts.RadarColumnSeries());
    series.dataFields.categoryX = "country";
    series.dataFields.valueY = "visits";
    series.tooltipText = "{valueY.value}";
    series.columns.template.strokeOpacity = 0;
    series.columns.template.radarColumn.cornerRadius = 5;
    series.columns.template.radarColumn.innerCornerRadius = 0;

    // Define specific colors for the series
    chart.colors.list = [
      am4core.color("#ffb57e"),
      am4core.color("#279fac"),
      am4core.color("#ffb57e"),
      am4core.color("#279fac"),
      am4core.color("#ffb57e"),
      am4core.color("#279fac"),
      am4core.color("#ffb57e"),
      am4core.color("#279fac"),
      am4core.color("#ffb57e"),
      am4core.color("#279fac"),
      am4core.color("#ffb57e"),
    ];

    // Set color based on index of series
    series.columns.template.adapter.add("fill", (fill, target) => {
      return chart.colors.getIndex(target.dataItem.index);
    });

    // Disable zoom out button
    chart.zoomOutButton.disabled = true;

    // Cursor
    chart.cursor = new am4charts.RadarCursor();
    chart.cursor.behavior = "none";
    chart.cursor.lineX.disabled = true;
    chart.cursor.lineY.disabled = true;

    // Disable logo
    chart.logo.disabled = true;

    // Update chart data every 2 seconds
    const interval = setInterval(() => {
      am4core.array.each(chart.data, (item) => {
        item.visits *= Math.random() * 0.5 + 0.5;
        item.visits += 10;
      });
      chart.invalidateRawData();
    }, 2000);

    // Cleanup
    return () => {
      clearInterval(interval);
      chart.dispose();
    };
  }, []);
  useEffect(() => {
    // Apply the animated theme
    am4core.useTheme(am4themes_animated);

    // Create chart instance
    const chart = am4core.create("doc-chart-01", am4charts.RadarChart);

    // Set chart data
    chart.data = [
      { country: "USA", visits: 2025 },
      { country: "China", visits: 1882 },
      { country: "Japan", visits: 1809 },
      { country: "Germany", visits: 1322 },
      { country: "UK", visits: 1122 },
      { country: "France", visits: 1114 },
      { country: "India", visits: 984 },
      { country: "Spain", visits: 711 },
      { country: "Netherlands", visits: 665 },
      { country: "Russia", visits: 580 },
      { country: "South Korea", visits: 443 },
      { country: "Canada", visits: 441 },
    ];

    chart.rtl = true;
    chart.innerRadius = am4core.percent(40);

    // Create axes
    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.dataFields.category = "country";
    categoryAxis.renderer.minGridDistance = 60;
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.labels.template.location = 0.5;
    categoryAxis.renderer.grid.template.strokeOpacity = 0.08;

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.extraMax = 0.1;
    valueAxis.renderer.grid.template.strokeOpacity = 0.08;

    chart.seriesContainer.zIndex = -10;

    // Create series
    const series = chart.series.push(new am4charts.RadarColumnSeries());
    series.dataFields.categoryX = "country";
    series.dataFields.valueY = "visits";
    series.tooltipText = "{valueY.value}";
    series.columns.template.strokeOpacity = 0;
    series.columns.template.radarColumn.cornerRadius = 5;
    series.columns.template.radarColumn.innerCornerRadius = 0;
    chart.colors.list = [
      am4core.color("#279fac"),
      am4core.color("#ffb57e"),
      am4core.color("#279fac"),
      am4core.color("#ffb57e"),
      am4core.color("#279fac"),
      am4core.color("#ffb57e"),
      am4core.color("#279fac"),
      am4core.color("#ffb57e"),
      am4core.color("#279fac"),
      am4core.color("#ffb57e"),
      am4core.color("#279fac"),
      am4core.color("#ffb57e"),
    ];

    chart.zoomOutButton.disabled = true;

    // Adapter for color
    series.columns.template.adapter.add("fill", (fill, target) => {
      return chart.colors.getIndex(target.dataItem.index);
    });

    // Update data periodically
    const interval = setInterval(() => {
      am4core.array.each(chart.data, (item) => {
        item.visits *= Math.random() * 0.5 + 0.5;
        item.visits += 10;
      });
      chart.invalidateRawData();
    }, 2000);

    categoryAxis.sortBySeries = series;

    // Set cursor
    chart.cursor = new am4charts.RadarCursor();
    chart.cursor.behavior = "none";
    chart.cursor.lineX.disabled = true;
    chart.cursor.lineY.disabled = true;

    chart.logo.disabled = true;

    // Cleanup chart on component unmount
    return () => {
      clearInterval(interval);
      chart.dispose();
    };
  }, []);

  // Patient IN Chart
  const options = {
    chart: {
      height: 400,
      type: "bar",
      sparkline: { show: false },
      toolbar: { show: false },
    },
    colors: ["#089bab", "#FC9F5B"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "30%",
        endingShape: "rounded",
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: false,
      width: 5,
      colors: ["#ffffff"],
    },
    series: [
      {
        name: "Male",
        data: [44, 90, 90, 60, 115],
      },
      {
        name: "Female",
        data: [35, 80, 100, 70, 95],
      },
    ],
    fill: { opacity: 1 },
    tooltip: {
      y: {
        formatter: (val) => `$ ${val} thousands`,
      },
    },
  };

  const tableData = [
    {
      label: "Excellent",
      value: 2400,
      percentage: "60%",
      statusClass: "status-online",
    },
    {
      label: "Very Good",
      value: 1200,
      percentage: "30%",
      statusClass: "status-blue",
    },
    {
      label: "Good",
      value: 240,
      percentage: "6%",
      statusClass: "status-primary",
    },
    { label: "Fair", value: 80, percentage: "2%", statusClass: "status-info" },
    { label: "Poor", value: 40, percentage: "1%", statusClass: "status-away" },
    {
      label: "Very Poor",
      value: 40,
      percentage: "1%",
      statusClass: "status-danger",
    },
  ];

  const tasks = {
    home: [
      "You should check in some of below.",
      "Get the address of customer",
      "Contact Vendor for parcel",
      "Refuel delivery truck",
      "Pick up for order no. 334",
      "Pay taxes for every bill",
      "I am designers & I have no life",
      "This is a good product. Buy it",
    ],
    profile: [
      "You should check in on some of below.",
      "You should check in on some of below.",
    ],
    contact: [
      "You should check in on some of below.",
      "You should check in on some of below.",
      "You should check in on some of below.",
    ],
  };

  const timelineData = [
    {
      title: "Patient Checkup",
      date: "23 November 2019",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque scelerisque",
      dotClass: "",
    },
    {
      title: "Patient Admit",
      date: "24 November 2019",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque scelerisque",
      dotClass: "border-success",
    },
    {
      title: "Treatment Starts",
      date: "24 November 2019",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque scelerisque",
      dotClass: "border-primary",
    },
    {
      title: "Patient Discharge",
      date: "30 November 2019",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque scelerisque",
      dotClass: "border-warning",
    },
  ];

  const patientsData = [
    {
      name: "Petey Cruiser",
      email: "peteycruiser01@gmail.com",
      contact: "+1-202-555-0146",
      disease: "Fever",
    },
    {
      name: "Anna Sthesia",
      email: "annasthesia121@gmail.com",
      contact: "+1-202-555-0164",
      disease: "Cancer",
    },
    {
      name: "Paul Molive",
      email: "paulmolive30@gmail.com",
      contact: "+1-202-555-0153",
      disease: "Diabetes",
    },
    {
      name: "Anna Mull",
      email: "annamull07@gmail.com",
      contact: "+1-202-555-0154",
      disease: "Eye",
    },
    {
      name: "John Deo",
      email: "johndeo123@gmail.com",
      contact: "+1-202-555-0155",
      disease: "Lung",
    },
  ];

  const reportData = [
    {
      name: "X-ray.pdf",
      link: "#",
      buttonLabel: "Download",
      buttonVariant: "info-subtle",
      mb: 4,
    },
    {
      name: "pathologyreport.pdf",
      link: "#",
      buttonLabel: "Download",
      buttonVariant: "info-subtle",
      mb: 4,
    },
    {
      name: "laboratoryreports.pdf",
      link: "#",
      buttonLabel: "On Hold",
      buttonVariant: "danger-subtle",
      mb: 4,
    },
    {
      name: "operativereport.pdf",
      link: "#",
      buttonLabel: "Download",
      buttonVariant: "info-subtle",
      mb: 0,
    },
  ];

  return (
    <>
      <Row>
        {/* Activity Statistic */}
        <Col lg={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between">
              <Card.Header.Title>
                <h4 className="card-title">Activity Statistic</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body className="pt-0">
              <Chart
                options={chartOptions}
                series={chartOptions.series}
                type="bar"
                height={350}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Banner Image */}
        <Col lg={4}>
          <Card>
            <div className="rounded d-flex align-items-center justify-content-center pb-4 pt-1">
              <img
                src={generatePath("/assets/images/page-img/39.png")}
                className="img-fluid rounded"
                alt="banner-img"
              />
            </div>
          </Card>
        </Col>

        {/* Patient Distribution */}
        <Col md={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between ">
              <Card.Header.Title>
                <h4 className="card-title">Patient Distribution</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body className="pt-0">
              <div id="doc-chart-01" style={{ height: "415px" }}></div>
            </Card.Body>
          </Card>
        </Col>

        {/* Patients In */}
        <Col md={6}>
          <Card>
            <Card.Header className="d-flex justify-content-between ">
              <Card.Header.Title className="header-title">
                <h4 className="card-title">Patients In</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body className="pt-0">
              <ReactApexChart
                options={options}
                series={options.series}
                type="bar"
                height={400}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col lg={4}>
          <Card>
            <Card.Header>
              <Card.Header.Title>
                <CardTitle as="h4">Patients Satisfactions</CardTitle>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <h2>3,897<span className="text-success font-size-14 ms-3 me-3"><i
                className="ri-arrow-up-fill me-2"></i>+3.3%</span><small
                  className="text-secondary font-size-14">Generated by
                  clients</small>
              </h2>

              <ProgressBar className="mt-3">
                <ProgressBar striped variant="primary" now={40} />
                <ProgressBar striped variant="warning" now={20} />
                <ProgressBar striped variant="info" now={10} />
                <ProgressBar striped variant="danger" now={40} />
                <ProgressBar striped variant="success" now={20} />
                <ProgressBar striped variant="secondary" now={10} />
              </ProgressBar>

              <div className="table-responsive mt-4">
                <Table borderless className="mb-0">
                  <tbody>
                    {tableData.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div
                            className={`profile-avatar ${item.statusClass} mt-4`}
                          ></div>
                        </td>
                        <td>
                          <h4>{item.label}</h4>
                        </td>
                        <td>
                          <span className="text-muted">{item.value}</span>
                        </td>
                        <td>{item.percentage}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Tab.Container defaultActiveKey="home">
            <Card>
              <Card.Header className="d-flex justify-content-between gap-2 border-bottom pb-0">
                <Card.Header.Title className="header-title">
                  <CardTitle as="h4">Tasks</CardTitle>
                </Card.Header.Title>
                <div className="card-header-toolbar d-flex align-items-center">
                  <Nav
                    variant="pills"
                    className="custom-nav-pills flex-nowrap"
                  >
                    {Object.keys(tasks).map((key) => (
                      <Nav.Item key={key}>
                        <Nav.Link
                          eventKey={key}
                          className="text-primary-subtle"
                        >
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Nav.Link>
                      </Nav.Item>
                    ))}
                  </Nav>
                </div>
              </Card.Header>
              <Card.Body>
                <Tab.Content>
                  {Object.keys(tasks).map((key) => (
                    <Tab.Pane eventKey={key} key={key}>
                      {tasks[key].map((task, index) => (
                        <div
                          className="d-flex justify-content-between tasks-card"
                          role="alert"
                          key={index}
                        >
                          <div className="custom-control custom-checkbox d-flex justity-content-center align-items-center gap-1">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id={`${key}-task-${index}`}
                            />{" "}
                            <label
                              className="custom-control-label ms-1"
                              htmlFor={`${key}-task-${index}`}
                            >
                              {task}
                            </label>
                          </div>
                          <i className="ri-close-line"></i>
                        </div>
                      ))}
                    </Tab.Pane>
                  ))}
                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>
        </Col>
        <Col lg={4}>
          <Card>
            <Card.Header className="d-flex justify-content-between iq-new-appoinments">
              <Card.Header.Title>
                <h4 className="card-title">Patient Timeline</h4>
              </Card.Header.Title>
              <div className="card-header-toolbar d-flex align-items-center">
                <Dropdown className="appointments-dropdown">
                  <Dropdown.Toggle
                    as="span"
                    className="text-primary"
                    id="dropdownMenuButton4"
                    bsPrefix=" "
                  >
                    View All
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    align="end"
                    aria-labelledby="dropdownMenuButton4"
                  >
                    <Dropdown.Item href="#" className="d-flex"><i className="ri-eye-fill me-2"></i>View</Dropdown.Item>
                    <Dropdown.Item href="#" className="d-flex"><i className="ri-delete-bin-6-fill me-2"></i>Delete</Dropdown.Item>
                    <Dropdown.Item href="#" className="d-flex"><i className="ri-pencil-fill me-2"></i>Edit</Dropdown.Item>
                    <Dropdown.Item href="#" className="d-flex"><i className="ri-printer-fill me-2"></i>Print</Dropdown.Item>
                    <Dropdown.Item href="#" className="d-flex"><i className="ri-file-download-fill me-2"></i>Download</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Card.Header>

            <Card.Body>
              <ul className="timeline">
                {timelineData.map((event, index) => (
                  <li key={index}>
                    <div
                      className={`timeline-dots mt-1 ${event.dotClass}`}
                    ></div>
                    <h6 className="float-start mb-1 mt-2">{event.title}</h6>
                    <small className="float-end mt-1 mt-2">
                      {event.date}
                    </small>
                    <div className="d-inline-block w-100">
                      <p>{event.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col lg={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center iq-new-appoinments">
              <Card.Header.Title>
                <h4 className="card-title">Patients Lists</h4>
              </Card.Header.Title>
              <div className="card-header-toolbar d-flex align-items-center">
                <Dropdown className="appointments-dropdown rtl-appointments-dropdown">
                  <Dropdown.Toggle
                    as="span"
                    className="text-primary pointer"
                    id="dropdownMenuButton4"
                    bsPrefix=" "
                    variant="link"
                  >
                    View All
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    align="end"
                    aria-labelledby="dropdownMenuButton5"
                  >
                    <Dropdown.Item href="#" className="d-flex">
                      <i className="ri-eye-fill me-2"></i>View
                    </Dropdown.Item>
                    <Dropdown.Item href="#" className="d-flex">
                      <i className="ri-delete-bin-6-fill me-2"></i>Delete
                    </Dropdown.Item>
                    <Dropdown.Item href="#" className="d-flex">
                      <i className="ri-pencil-fill me-2"></i>Edit
                    </Dropdown.Item>
                    <Dropdown.Item href="#" className="d-flex">
                      <i className="ri-printer-fill me-2"></i>Print
                    </Dropdown.Item>
                    <Dropdown.Item href="#" className="d-flex">
                      <i className="ri-file-download-fill me-2"></i>Download
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table className="mb-0 table-borderless">
                  <thead>
                    <tr>
                      <th scope="col">Patient</th>
                      <th scope="col">E-mail Id</th>
                      <th scope="col">Contact</th>
                      <th scope="col">Disease</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientsData.map((patient, index) => (
                      <tr key={index}>
                        <td>{patient.name}</td>
                        <td>{patient.email}</td>
                        <td>{patient.contact}</td>
                        <td>{patient.disease}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <div className="col-lg-4">
          <Card>
            <Card.Header>
              <Card.Header.Title>
                <h4 className="card-title">Patients Reports</h4>
              </Card.Header.Title>
            </Card.Header>
            <Card.Body>
              <ul className="report-lists m-0 p-0">
                {reportData.map((report, index) => (
                  <li
                    key={index}
                    className={`d-flex align-items-center justify-content-between  mb-${report.mb}`}
                  >
                    <div className="media-support-info">
                      <h6>{report.name}</h6>
                      <a href={report.link}>View report</a>
                    </div>
                    <Button variant={report.buttonVariant} name="button">
                      {report.buttonLabel}
                    </Button>
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </div>
      </Row >
    </>
  );
};

export default HospitalDashboardTwo;
